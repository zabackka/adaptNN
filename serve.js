// initial setup
var express = require('express')
var app = express()
var path = require('path');
var http = require('http');
var io = require('socket.io');


// serve static files in 'assets' directory
app.use(express.static(path.join(__dirname + '/assets')));

// create server, listening on port 8080
var server = http.createServer(app).listen(8080);

// intitialize server/client connection
io = io.listen(server);

// triggered when a new client connects
io.sockets.on("connection", function(socket) {
	// construct message to client
	var msg_to_client = {
		data:"hello?"
	}

	// send message to client
	socket.send(JSON.stringify(msg_to_client));
	console.log("SERVER: connection established -- message sent");

	// triggered when client sends a message
	socket.on("message", function(data) {
		// parse message & display to console
		data = JSON.parse(data);
		console.log("SERVER: new message from client:")
		console.log(data);

		// construct a reply to the client
		var send_back = {
			data: [12, 47];
		}

		// send reply to client
		socket.send(JSON.stringify(send_back));

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




