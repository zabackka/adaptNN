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
	var clientID = NUM_CLIENTS;
	console.log("CONNECTED CLIENT [" + clientID + "]");
	NUM_CLIENTS++;

	var sp = require('child_process').spawn;
	var py = sp('python', ['compute_input.py', NUM_PARAMS]);

	py.stdout.on('data', (data) => {
			console.log("Received: " + data);
	});

	// triggered when client sends a message
	socket.on("message", function(data) {
		// parse message & display to console
		data = JSON.parse(data);
		// retrieve params & performance
		params = data[0];
		performance = data[1];

		// /** PRINT check statements */
		// console.log("params: " + params);
		// console.log("performance: " + performance);



		//py.stdin.write("hello? \n");
		// 	var msg = "hello?";
		// 	py.stdin.write(JSON.stringify(msg) + '\n');

	});

	socket.on('disconnect', function() {
		console.log('CLIENT [' + clientID + "] DISCONNECTED");
	});
});



// RUN PYTHON CODE //

// define NUM_PARAMS, a constant that holds the number of params to update
// var NUM_PARAMS = 4;
// var params = [1, 2, 3, 4];

// // spawn child process (to run python code)
// var sp = require('child_process').spawnSync;
// var py = sp('python', ['compute_input.py', NUM_PARAMS]);

// py.stdin.write(JSON.stringify(params));

// // listen for python file data writes
// // parse data received from python file
// py.stdout.on('data', (data) => {
// 	//data = parseFloat(data); 
// 	console.log("Received: " + data);
// 	py.stdin.write("SUCCESS -- SEND NEXT VALUE");
		
// });


// // send data to python file for computation
// //py.stdin.write(JSON.stringify(sendData));

// py.stdout.on('error', (error) => {
// 	console.log(error);
// });

// // end connection to python file
// py.stdout.on('end', () => { 
// 	console.log( 'no more data to read' ); 
// });



