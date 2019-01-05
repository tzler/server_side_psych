// npm install express
var express = require('express');
// an instance of express 
var app = express();
// the port we'll use
var use_port = 8888;

// open up a port 
app.listen(use_port, function () {
  // log message onto the console
  console.log('Example app listening on port ' + use_port);
});

// listen to incoming requests
app.get('/', function (req, res) {
  // client response protocol
  res.send("Hello World!");
});
