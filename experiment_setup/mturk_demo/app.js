// IMPORT MODULES 

const express = require('express');
const app = express();
const fs = require('fs'); 
const mongo_client = require('mongodb').MongoClient;
const assert = require('assert');
const https = require('https');
const socket_io = require('socket.io');

// set database and collection we'll be using
const database_name = 'hello_world_database'
const collection_name = 'mturk_demo'

// your worker ID--so can troubleshoot your HIT :) 
const allowed_to_repeat = ['A33F2FVAMGJDGG'] 

// set base directory across modules 
global.__base = __dirname + '/';

// SETUP TRAFFIC PERMISSIONS (MONGO/HTTPS/firewall)

// firewall permitted port we'll use
const external_port = 8888;
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
//console.log('mongo_url:', mongo_url)

// DEFINE SERVER SIDE OPERATIONS

// open port on the serverd 
server.listen(external_port, function() {
  // server side console log
  console.log('running on port ', external_port) 
})

// listen to incoming requests
app.get('/*', function (req, res) {
  // server distribution protocol
  initialization(req, res) 
});

// protocol for returning files to client
var serve_file = function(req, res) {
  // extract name of file requested
  var file_name = req.params[0];
   // server side console log
  console.log('\t :: express :: file requested: ' + file_name);
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
var db_insert = function(trial_data) {
  // connect to mongo server
  mongo_client.connect(mongo_url, { useNewUrlParser: true }, function(err,client) {
    // verify connection
    assert.equal(null, err);
    if (typeof(trial_data) == 'string') { 
      // convert string to a JSON object
      var formatted_data = { text_input: trial_data}
    } else {
      var formatted_data = trial_data
    }
    // establish which collection we're using (which is in a database)
    var collection = client.db(database_name).collection(collection_name)
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
    var collection = client.db(database_name).collection(collection_name)
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

var initialization = function( req, res ) {

  // extract from request to server (only returns worker_id for first ping from mturk)
  var worker_id = req.query.workerId;
  // let some people pass no matter what--e.g. you when troublishooting code :) 
  var let_pass = allowed_to_repeat.indexOf(worker_id) > -1
  console.log('LET PASS', let_pass) 
  
  // worker_id is undefined if experiment is in preview mode -- or not on mturk
  if (worker_id != undefined){
    
    // extract collection from mturk url--flexible, but ideosyncratic to submission protocol!
    collection = req.originalUrl.slice(1, req.originalUrl.indexOf('index.html')-1)

    // optional: query the database and wait for the promise -- it could take a while
    var mongo_query = new Promise( function (resolve, reject ) {
      get_previous_participation(worker_id, database_name, collection_name, resolve, reject)
    })
    // wait for the promise untill deciding if subjects should participate
    mongo_query.then( function ( participation) {
        
      if (! participation | let_pass ) {
        // serve experiment
        return serve_file( req, res )
      } else {
        // send duplicate workers to another web page
        return handle_duplicate( req, res )
      }
    })
  // let everyone see instructions before accepting the HIT (i.e. worker_id is undefined)
  } else {
    return serve_file(req, res);
  }
}

var handle_duplicate = function(req, res) {
  console.log("duplicate id: blocking request");
  return res.sendFile( __base + 'utils/duplicate.html');
};

function get_previous_participation(worker_id, database, i_collection, resolve, reject){
  
  mongo_client.connect(mongo_url, { useNewUrlParser: true }, function(err,client) {
    // verify connection
    assert.equal(null, err);
    // establish which collection we're using (which is in a database)
    var collection = client.db(database_name).collection(collection_name)
    console.log("... linking up with mongo database to check for previous participation ");
    console.log('... searching through collection:', collection_name, 'for worker:', worker_id)
    // GET PARTICIPATION COUNT
    collection.find({'worker_id': worker_id}).count(function(err, results) {
      if (err) {
        console.log('error!')
      } else {
        // returns results with the promise
        console.log('... subject has participated in', results, 'trials')
        resolve(results)
      }
    })
  });
}
