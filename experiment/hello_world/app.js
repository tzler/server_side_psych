// npm install express
var express = require('express');
var fs = require('fs')
// an instance of express 
var app = express();
// the port we'll use
var port_location = 8884;

// extract relevant info from SSL key and certification
const options = {
	key:  fs.readFileSync("privatekey"), 
	cert: fs.readFileSync("certificate")
};

// setup server-side port using credentials 
const server = require('https').createServer(options,app)
		
// open port on the serverd 
server.listen(port_location, function() {
  console.log('running on port ', port_location) 
  }
)

// listen to incoming requests
app.get('/', function (req, res) {
  // client response protocol
  res.send("Hello World!");
});
