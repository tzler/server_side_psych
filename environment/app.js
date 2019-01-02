// TO DO: 
// - set up SSL certificates for snail server 

global.__base = __dirname + '/';

var 
    use_https       = true,
    argv            = require('minimist')(process.argv.slice(2)),
    https           = require('https'),
    fs              = require('fs'),
    app             = require('express')(),
    _               = require('lodash'),
    parser          = require('xmldom').DOMParser,
    XMLHttpRequest  = require("xmlhttprequest").XMLHttpRequest,
    sendPostRequest = require('request').post;    
    utils           = require('./utils/shared.js') // utils that we've developed
    database        = 'task_stream'

if(argv.port) {
  var port_location= argv.port;
  console.log('using port ' + port_location);
} else {
  var port_location = 8880;
  console.log('no port specified: using 8880\nUse the --port flag to change');
}

try {
  var privateKey  = fs.readFileSync('/etc/apache2/ssl/rxdhawkins.me.key'),
      certificate = fs.readFileSync('/etc/apache2/ssl/rxdhawkins.me.crt'),
      intermed    = fs.readFileSync('/etc/apache2/ssl/intermediate.crt'),
      options     = {key: privateKey, cert: certificate, ca: intermed},
      server      = require('https').createServer(options,app).listen(port_location),
      io          = require('socket.io')(server);
} catch (err) {
  console.log("cannot find SSL certificates; falling back to http");
  var server      = app.listen(port_location),
      io          = require('socket.io')(server);
}

// INITIAL PROTOCOL
app.get( '/*' , query_database_and_set_experimental_params_before_serving )

// app.get( '/*', just_serve_experiment)



// DATABASE PROTOCOL
io.on('connection', function (socket) {
  socket.on('current_data', function(data) {
      console.log('current_data received: ' + JSON.stringify(data));
      write_data_to_mongo(data);
  });
});


  
var query_database_and_set_experimental_params_before_serving = function( req, res ) {
  
  // extract from request to server (only returns worker_id for first ping from mturk) 
  var worker_id = req.query.workerId;
  // the databse you want search and save things within 
  
  // let some people pass no matter what -- e.g. yourself
  var let_pass = ['A33F2FVAMGJDGG', 'other_worker_ids'].indexOf(worker_id) > -1

  // worker_id is undefined if experiment is in preview mode -- or not on mturk 
  if (worker_id != undefined){
	  
    // extract collection from mturk url--flexible, but ideosyncratic to submission protocol!  
    collection = req.originalUrl.slice(1, req.originalUrl.indexOf('index.html')-1) 
    
    // optional: query the database and wait for the promise -- it could take a while 
    var mongo_query = new Promise( function (resolve, reject ) { 
      utils.get_previous_participation(id, database, collection, resolve, reject)
    })
    
    // wait for the promise untill deciding if subjects should participate 
    mongo_query.then( function ( participation) { 

        if (! participation | let_pass ) {
 
          // update parameters for the particular experiment we're in
          if (collection == 'sr_buttons' | collection == 'stimulus_response') { 
            utils.determine_set_size()} 
          
          // serve experiment 
          return utils.serve_file( req, res )
        
        } else {
          return utils.handle_duplicate( req, res )
        }
    })
  // let everyone see instructions before accepting the HIT (i.e. worker_id is undefined)
  } else {
    
    return utils.serve_file(req, res);
  
  }
}

var just_serve_experiment = function( req, res ) {
  return utils.serve_file( req, res )
}

var write_data_to_mongo = function(data) {
      sendPostRequest(
        'http://localhost:4000/db/insert',
        { json: data },
        (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log(`sent data to store`);
      } else {
        console.log(`error sending data to store: ${error} ${body}`);
      }
    }
  );
};
