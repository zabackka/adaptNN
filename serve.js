var express = require('express')
var app = express()
var path = require('path');
// var cors = require('cors');
// cors({credentials: true, origin: true});
// app.use(cors());

app.set('port', (process.env.PORT || 8080))
app.use(express.static(path.join(__dirname + '/assets'))); 

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});




