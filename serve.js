var express = require('express')
var app = express()
var path = require('path');
// var cors = require('cors');
// cors({credentials: true, origin: true});
// app.use(cors());

app.set('port', (process.env.PORT || 8080))
app.use(express.static(path.join(__dirname + '/assets'))); 
// app.use('Access-Control-Allow-Origin':'*');
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


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


