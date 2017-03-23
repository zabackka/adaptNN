//start.js

// initial setup for serving webpage to browser
var express = require('express')
var app = express()
var path = require('path');
var http = require('http');
var io = require('socket.io');
const fs = require('fs');

var NUM_PARAMS = 4; 
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

// triggered when a new client connects
io.sockets.on("connection", function(socket) {
	// assign CLIENT ID
	var clientID = NUM_CLIENTS;
	console.log("CONNECTED CLIENT [" + clientID + "]");
	NUM_CLIENTS++;

	var params = [];
	var performance = 0;

	// spawn child process (python script)
	var sp = require('child_process').spawn;
	var py = sp('python', ['compute_input.py', NUM_PARAMS]);


	// triggered when client sends a message
	socket.on("message", function(data) {
		// parse message & display to console
		data = JSON.parse(data);	
		// retrieve params & performance
		params = data[0];
		performance = data[1];

		/** PRINT check statements */
		console.log("params: " + params);
		console.log("performance: " + performance);

		py.stdin.write(JSON.stringify(performance) + "\n");
		
		py.stdout.on('data', (data) => {
			console.log("-->received from server: " + data);
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





