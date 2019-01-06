// SETUP MODULES 
//
// npm install express
const express = require('express');
// built in 'file system' operations
const fs = require('fs')
// express instance--'app' is the convention 
const app = express();

// SETUP MONGO AND SSL TRAFFIC PERMISSIONS
//
// firewall permitted port we'll use
const port_location = 8889;
// location of ssl and mongo credentials
const credentials = 'credentials/'
// extract relevant info from SSL key and certification
const options = {
	key:  fs.readFileSync(credentials + "ssl_privatekey"), 
	cert: fs.readFileSync(credentials + "ssl_certificate")
};

// SETUP SERVER-SIDE OPERATIONS 
// 
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
  res.send("hello world!");
});
