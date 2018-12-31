var _ = require('underscore');
var fs = require('fs');
//var path = require('path');
//var mkdirp = require('mkdirp');

var sendPostRequest = require('request').post;

var serve_file = function(req, res) {
  var file_name = req.params[0];
  console.log('\t :: Express :: file requested: ' + file_name);
  return res.sendFile(file_name, {root: __base});
};

var handle_duplicate = function(req, res) {
  console.log("duplicate id: blocking request");
  return res.sendFile( __base + 'utils/duplicate.html');
//  return res.serve('utils/

};

function get_previous_participation(worker_id, database, i_collection, resolve, reject){

  // CONNECT TO DATABASE
  const mongo_creds = require('../auth.json');
  const mongo_url = `mongodb://${mongo_creds.user}:${mongo_creds.password}@localhost:27017/`;
  var  mongo_client = require('mongodb').MongoClient;
  const assert = require('assert');

  // connect to the server
  mongo_client.connect(mongo_url, function(err, client) {
    // make sure we didn't throw an error
    assert.equal(null, err);
    // connect to database and collection
    const db = client.db(database);
    const collection = db.collection(i_collection);
    // log success
    console.log("... linking up with mongo database to check for previous participation ");
    console.log('... searching through collection:', i_collection, 'for worker:', worker_id)
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

function determine_set_size(){

  // loads previous history of set sizes, determines current set size, updates history file
 
  set_size_location = 'support/'  
  // load possible and history of set sizes
  var data = JSON.parse(fs.readFileSync( set_size_location + 'numbers.txt'))
  // determine position within possible based on history
  index_possible = data['actual'].length % data['possible'].length
  // determine next experiment interval
  experiment_set_size = data['possible'][index_possible]
  // update history of set sizes
  data['actual'][data['actual'].length] = experiment_set_size
  // save updated histor
  fs.writeFileSync( set_size_location + 'numbers.txt',  JSON.stringify(data));
  console.log('... setting experimental set size to', experiment_set_size, 'classes')

}

function clear_history(){

  // load possible and history of set sizes
  var data = JSON.parse(fs.readFileSync('../support/numbers.txt'))
  console.log('previous history:', data['actual'])
  // update history of set sizes
  data['actual'] = []
  // save updated history
  fs.writeFileSync('../support/numbers.txt',  JSON.stringify(data));
  var updated_data = JSON.parse(fs.readFileSync('numbers.txt'))
  console.log('current history:', updated_data['actual'])
}

module.exports = {
  serve_file,
  handle_duplicate,
  get_previous_participation, 
  determine_set_size, 
};
