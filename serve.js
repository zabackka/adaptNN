var express = require('express')
var app = express()
var path = require('path');

app.set('port', (process.env.PORT || 8080))
app.use(express.static(path.join(__dirname + '/assets'))); 

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

////////////////////////
/// ML FUNCTIONALITY ///
////////////////////////

const spawn = require('child_process').spawn;
const scriptExecution = spawn("python", ["adaptNN.py"]);

scriptExecution.stdout.on('data', (data) => {
	console.log(String.fromCharCode.apply(null, data));
});

var data = JSON.stringify([1,2,3,4]);
scriptExecution.stdin.write(data);

scriptExecution.stdin.end();

app.post("/getSum", function(request, response) {
	var sum; 
	sum = request.body.sum;
	return response.json({}, 200);
});


