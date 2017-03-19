//start.js

// initial setup for serving webpage to browser
var express = require('express')
var app = express()
var path = require('path');
var http = require('http');
var io = require('socket.io');


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
	// construct message to client
	var initial_client_message = {
		data:"SERVER: Client connection established"
	}

	// send message to client
	socket.send(JSON.stringify(initial_client_message));

	// triggered when client sends a message
	socket.on("message", function(data) {
		// // parse message & display to console
		// data = JSON.parse(data);

		console.log("New data received from CLIENT:");
		datastr = JSON.parse(data);
		console.log(datastr);


		// // construct a reply to the client
		// var send_back = {
		// 	data: msg
		// }

		// // send reply to client
		// socket.send(JSON.stringify(send_back));

	});
});



// RUN PYTHON CODE //
// spawn child process (to run python code)
var spawn = require('child_process').spawn;
    py    = spawn('python', ['compute_input.py']);

    // create variable to hold data to send to py file
    data = [1,2,3,4,5,6,7,8,9];
    dataString = '';

// listen for python file data writes
// parse data received from python file
py.stdout.on('data', function(data){
  dataString += data.toString();
});

// print sum when the child process is finished
py.stdout.on('end', function(){
  console.log('Sum of numbers=',dataString);
});

// send data to python file for computation
py.stdin.write(JSON.stringify(data));

// end connection to python file
py.stdin.end();