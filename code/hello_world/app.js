// IMPORT MODULES 
// npm install express
const express = require('express');
// built in 'file system' operations
const fs = require('fs')
// express instance--'app' is the convention 
const app = express();
// mongo database modules
const mongo_client = require('mongodb').MongoClient;
// assertion helpers
const assert = require('assert');


// SETUP TRAFFIC PERMISSIONS (MONGO/HTTPS/firewall)
// firewall permitted port we'll use
const external_port = 8889;
// location of ssl and mongo credentials
const credentials = 'credentials/'
// extract relevant info from SSL key and certification
const options = {
	key:  fs.readFileSync(credentials + "ssl_privatekey"), 
	cert: fs.readFileSync(credentials + "ssl_certificate")
};
// setup server-side port using credentials 
const server = require('https').createServer(options,app)
// extract mongo authentification keys
const db_key = JSON.parse(fs.readFileSync(credentials + 'mongo_keys')); 
// construct string from port and authentification data
const mongo_url = `mongodb://${db_key.user}:${db_key.pwd}@localhost:27017/`;


// ESTABLISH MONGO CONNECTION
// nothing helpful yet, just connect
mongo_client.connect(mongo_url, function(err, client) {
    // make sure we didn't throw an error
    assert.equal(null, err);
    console.log('connected to database :D')
  }
);


// SETUP SERVER-SIDE OPERATIONS 
// open port on the serverd 
server.listen(external_port, function() {
  console.log('running on port ', external_port) 
  }
)
// listen to incoming requests
app.get('/', function (req, res) {
  // client response protocol
  res.send("hello world!");
});
