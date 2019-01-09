global.__base = __dirname + '/';

// IMPORT MODULES 
const express = require('express');
const app = express();
const fs = require('fs'); 
const mongo_client = require('mongodb').MongoClient;
const assert = require('assert');
const https = require('https');
const socket_io = require('socket.io');
//const send_post_request = require('request').post

// SETUP TRAFFIC PERMISSIONS (MONGO/HTTPS/firewall)
// firewall permitted port we'll use
const external_port = 8888;
// location of ssl and mongo credentials
const credentials = 'credentials/'
// extract relevant info from SSL key and certification
const options = {
	key:  fs.readFileSync(credentials + "ssl_privatekey"), 
	cert: fs.readFileSync(credentials + "ssl_certificate")
};
// setup server-side port using credentials 
const server = https.createServer(options,app)
const io = socket_io(server)
const no_io = socket_io()

// extract mongo authentification keys
const db_key = JSON.parse(fs.readFileSync(credentials + 'mongo_keys')); 
// construct string from port and authentification data
const mongo_url = `mongodb://${db_key.user}:${db_key.pwd}@localhost:27017`;
//
console.log('mongo_url:', mongo_url)

// SETUP SERVER-SIDE OPERATIONS 
// open port on the serverd 
server.listen(external_port, function() {
  console.log('running on port ', external_port) 
  }
)
// listen to incoming requests
app.get('/*', function (req, res) {
  // client response protocol
	serve_file(req, res) 
});

var serve_file = function(req, res) {
  var file_name = req.params[0];
  console.log('\t :: Express :: file requested: ' + file_name);
  return res.sendFile(file_name, {root: __base});
};


io.on('connection', function (socket) {
  // define insertion protocol on hearing 'insert'
  socket.on('insert', function(hello_input) {
    console.log('data received on the server:\n ' + JSON.stringify(hello_input));
    db_insert(hello_input);
  });
  
  // define extraction procotol on hearing 'extract'
  socket.on('extract', function() {
    db_extract();
  });

});

var db_insert = function(text_data) {
  mongo_client.connect(mongo_url, function(err,client) {
    // make sure we didn't throw an error
    assert.equal(null, err);
    // inputs are JSON objects, not a string like we extracted
    var formatted_data = { text_input: text_data}
    var database = client.db('test_database')
    var collection = database.collection("test_collection")
    collection.insertOne(formatted_data, function(err, res) {
      if (err) throw err;
      console.log('\t :: mongodb :: document inserted')
      client.close();
    })
  });
};

var db_extract = function() {
  mongo_client.connect(mongo_url, function(err,client) {
    // make sure we didn't throw an error
    assert.equal(null, err);
    // inputs are JSON objects, not a string like we extracted
    var database = client.db('test_database')
    var collection = database.collection("test_collection")
    
    collection.find().toArray(function(err, docs){
      var random_document = Math.round(Math.random()*(docs.length-1))
      console.log('server side document extracted from mongodb:\n', docs[random_document])
      io.emit('return_document_from_database', docs[random_document])

    })
  });
};

no_io.emit('things', {words: 'lots of other things'})

