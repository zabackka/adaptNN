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
	// assign CLIENT ID
	var clientID = NUM_CLIENTS;
	clients.push(socket);
	console.log("CONNECTED CLIENT [" + clientID + "]");
	NUM_CLIENTS++;

	var params = [];
	var performance = 0;

	// spawn child process (python script)
	const err = fs.openSync('err.txt', 'a');
	var sp = require('child_process').spawn;
	var py = sp('python', ['adaptNN.py', NUM_PARAMS], {
		stdio: ['pipe', 'pipe', err]
	});

	var msgNum = 0;
	var numWrites = 0;
	var numDataReads = 0; 

	// triggered when client sends a message
	socket.on("message", function(data) {
		msgNum++;
		
		// parse message & display to console
		data = JSON.parse(data);	
		// retrieve params & performance
		params = data[0];
		performance = data[1];

		/** PRINT check statements */
		console.log("params: " + params);
		console.log("performance: " + performance);

		// console.log("message #" + msgNum);

		// performance = performance + msgNum;
		py.stdin.write(JSON.stringify(data) + "\n");
		numWrites++;
		console.log("number of writes: " + numWrites);
		
		// receive output from python child process
		py.stdout.once('data', (data) => {
			console.log("-->received from server: " + data);

			var sendBack = JSON.parse(data);
			numDataReads++; 
			console.log("number of data reads: " + numDataReads);

			//console.log("send back: " + sendBack);
			clients[clientID].emit('data', data);
			//console.log("send data back to client");
		});



		py.stdout.on('end', () => {
			console.log("end!");
		});


	});

	// handle client disconnect
	socket.on('disconnect', function() {
		console.log('CLIENT [' + clientID + "] DISCONNECTED");
	});
});





