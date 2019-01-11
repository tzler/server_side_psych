// IMPORT MODULES 

const express = require('express');
const app = express();
const fs = require('fs'); 
const mongo_client = require('mongodb').MongoClient;
const assert = require('assert');
const https = require('https');
const socket_io = require('socket.io');

// set base directory across modules 
global.__base = __dirname + '/';

// SETUP TRAFFIC PERMISSIONS (MONGO/HTTPS/firewall)

// firewall permitted port we'll use
const external_port = 8881;
// location of ssl and mongo credentials
const credentials = '../credentials/'
// extract relevant info from SSL key and certification
const options = {
  key:  fs.readFileSync(credentials + "ssl_privatekey"), 
	cert: fs.readFileSync(credentials + "ssl_certificate")
};
// setup server-side port using credentials 
const server = https.createServer(options,app)
const io = socket_io(server)
// extract mongo authentification keys
const db_key = JSON.parse(fs.readFileSync(credentials + 'mongo_keys')); 
// construct string from port and authentification data
const mongo_url = `mongodb://${db_key.user}:${db_key.pwd}@localhost:27017`;
console.log('mongo_url:', mongo_url)

// DEFINE SERVER SIDE OPERATIONS

// open port on the serverd 
server.listen(external_port, function() {
  // server side console log
  console.log('running on port ', external_port) 
})

// listen to incoming requests
app.get('/*', function (req, res) {
  // client response protocol
	serve_file(req, res) 
});

// protocol for returning files to client
var serve_file = function(req, res) {
  // extract name of file requested
  var file_name = req.params[0];
   // server side console log
  console.log('\t :: Express :: file requested: ' + file_name);
  // return file to client
  return res.sendFile(file_name, {root: __base});
};

// set up connection to listen for client
io.on('connection', function (socket) {
  // insertion protocol on hearing 'insert' from client
  socket.on('insert', function(user_input) {
    // server side console log
    console.log('server side: data received:\n ' + JSON.stringify(user_input));
    // call function to insert data into mongo 
    db_insert(user_input);
  }); 
  // extraction procotol on hearing 'extract' from client
  socket.on('extract', function() {
    // call function to extract data from mongo
    db_extract();
  });
});

// insert into database function
var db_insert = function(text_data) {
  // connect to mongo server
  mongo_client.connect(mongo_url, { useNewUrlParser: true }, function(err,client) {
    // verify connection
    assert.equal(null, err);
    // convert string to a JSON object
    var formatted_data = { text_input: text_data}
    // establish which collection we're using (which is in a database)
    var collection = client.db('test_database').collection('test_collection')
    // insert JSON object into database
    collection.insertOne(formatted_data, function(err, res) {
      // server side console log
      console.log('\t :: mongodb :: document inserted')
      // close connection with database
      client.close();
    })
  });
};

// extract from database function
var db_extract = function() {
  // connect to mongo server
  mongo_client.connect(mongo_url, { useNewUrlParser: true }, function(err,client) {
    // verify connection
    assert.equal(null, err);
    // establish which collection we're using (which is in a database)
    var collection = client.db('test_database').collection('test_collection')
    // extract a random document (JSON object) from collection
    collection.find().toArray(function(err, docs){
      // set index of random document 
      var random_document = Math.round(Math.random()*(docs.length-1))
      // server side console log
      console.log('server side: document extracted from mongodb:\n', docs[random_document])
      // send document to client
      io.emit('return_document_from_database', docs[random_document])
    })
  });
};
