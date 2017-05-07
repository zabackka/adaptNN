//start.js

// initial setup for serving webpage to browser
var express = require('express')
var app = express()
var path = require('path');
var http = require('http');
var io = require('socket.io');
const fs = require('fs');

var NUM_PARAMS = 2;
var NUM_CLIENTS = 0;

var SESSION_ID = Math.floor((Math.random() * 1000) + 1);

// START SERVER // 
// serve static files in 'assets' directory
app.use(express.static(path.join(__dirname + '/assets')));

// create server, listening on port 8080
var server = http.createServer(app).listen(8080);

app.get('/', function(request, response) {
 	response.sendFile(path.join(__dirname + '/index.html'));
});



// SETUP CLIENT-SERVER CONNECTION //
// intitialize server/client connection
io = io.listen(server);
var clients = [];

// triggered when a new client connects
io.sockets.on("connection", function(socket) {
	socket.setMaxListeners(Infinity);

	// assign CLIENT ID
	var clientID = NUM_CLIENTS;
	
	// add new client to list of clients
	clients.push(socket);
	NUM_CLIENTS++;
	
	// log new client connection to terminal
	console.log("CONNECTED CLIENT [" + clientID + "]");

	// spawn child process (python script)
	const err = fs.openSync('err.txt', 'a');
	var sp = require('child_process').spawn;
	var py = sp('python', ['adaptNN.py', NUM_PARAMS], {
		stdio: ['pipe', 'pipe', err]
	});

	// set max listeners for python child process
	py.stdin.setMaxListeners(Infinity);
	py.stdout.setMaxListeners(Infinity);
 
	// create stream to write data to .csv file (for later use)
	var writeStream = fs.createWriteStream(SESSION_ID + "-" + clientID + ".csv", {flags: 'a'});

	// triggered when client sends a message
	socket.on("message", function(data) {
		// parse message & display to console
		data = JSON.parse(data);	
		
		//log when data was sent, along with the results (i.e. performance) for those specific param values
		var date = new Date();
		writeStream.write(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds() + ",");
		writeStream.write(data[0][0] + "," + data[0][1] + "," + data[0][3] + "," + data[0][4] + "\n");

		// send data from client to python child process
		py.stdin.write(JSON.stringify(data[1]) + "\n");	

	});

	// process and send output from python child process to client
	py.stdout.on('data', (data) => {
		// parse data
		data = JSON.parse(data);
		// send modified input data back to client
		clients[clientID].emit('data', data);
	});

	// handle CLIENT disconnect
	socket.on('disconnect', function() {
		console.log('CLIENT [' + clientID + "] DISCONNECTED");
		writeStream.end();

	});
});










