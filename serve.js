var express = require('express')
var app = express()
var path = require('path');

// new
var http = require('http');
var io = require('socket.io');

app.use(express.static(path.join(__dirname + '/assets')));
var server = http.createServer(app).listen(8080);
io = io.listen(server);

io.sockets.on("connection", function(socket) {
	var msg_to_client = {
		data:"hello?"
	}

	socket.send(JSON.stringify(msg_to_client));
	console.log("SERVER: connection established -- message sent");

	socket.on("message", function(data) {
		data = JSON.parse(data);
		console.log("SERVER: new message from client:")
		console.log(data);

		var send_back = {
			data:"got your message!"
		}

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




