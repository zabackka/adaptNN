//start.js

// initial setup for serving webpage to browser
var express = require('express')
var app = express()
var path = require('path');
var http = require('http');
var io = require('socket.io');
const fs = require('fs');

var NUM_PARAMS = 7;
var NUM_CLIENTS = 0;
var date = new Date();

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
 

	// triggered when client sends a message
	socket.on("message", function(data) {
		// parse message & display to console
		data = JSON.parse(data);	
		var writeStream = fs.createWriteStream("test1.csv", {flags: 'a'});

		writeStream.write("hello?" + date.getTime() + "," + data[0] + "," + data[1] + "\n" + "fish\n");
		// retrieve params & performance
		fs.writeFile("test.csv", "HELLO??" + date.getSeconds() + "," + data[0] + "," + data[1] + "\n" + "fish", function(err) {
			if (err) {
				return console.log(err);
			}

			console.log("success!");
		})
		/** PRINT check statements */
		// var params = data[0];
		// var performance = data[1];
		// console.log("params: " + params);
		// console.log("performance: " + performance);

		// send data from client to python child process
		py.stdin.write(JSON.stringify(data) + "\n");
		
		// receive output from python child process
		py.stdout.once('data', (data) => {
			
			/** PRINT check statement **/
			//console.log("-->received from server: " + data);
			
			// parse data
			data = JSON.parse(data);
			// send modified input data back to client
			clients[clientID].emit('data', data);
		});

		// handle end of python child process
		// should only be triggered in error 
		// --> [check 'err.txt' for details]
		py.stdout.on('end', () => {
			console.log("end!");
		});
	});

	// handle CLIENT disconnect
	socket.on('disconnect', function() {
		console.log('CLIENT [' + clientID + "] DISCONNECTED");
	});
});








