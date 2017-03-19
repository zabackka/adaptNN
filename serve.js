// initial setup
var express = require('express')
var app = express()
var path = require('path');
var http = require('http');
var io = require('socket.io');

// intialize for spawning child process (python execution)
const spawn = require('child_process').spawn;
const executePython = spawn("python", ['/assets/adaptNN.py']);


// serve static files in 'assets' directory
app.use(express.static(path.join(__dirname + '/assets')));

// create server, listening on port 8080
var server = http.createServer(app).listen(8080);



// intitialize server/client connection
io = io.listen(server);

// triggered when a new client connects
io.sockets.on("connection", function(socket) {
	// construct message to client
	var initial_client_message = {
		data:"Client connection established"
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

		executePython.stdin.write(data);

		executePython.stdout.on('data', function(data) {
			dataString += data.toString();
		});

		console.log("Received from python script: ");
		console.log(dataString);

		// // construct a reply to the client
		// var send_back = {
		// 	data: msg
		// }

		// // send reply to client
		// socket.send(JSON.stringify(send_back));

	});
});




// app.set('port', (process.env.PORT || 8080))
// app.use(express.static(path.join(__dirname + '/assets'))); 

app.get('/', function(request, response) {
 	response.sendFile(path.join(__dirname + '/index.html'));
 });

// app.listen(app.get('port'), function() {
//   console.log("Node app is running at localhost:" + app.get('port'));
// });




