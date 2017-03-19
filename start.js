//start.js

// initial setup for serving webpage to browser
var express = require('express')
var app = express()
var path = require('path');
var http = require('http');
var io = require('socket.io');


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