// TO DO: 
// - 
// - 
// - 

global.__base = __dirname + '/';

var 
    use_https     = true,
    argv          = require('minimist')(process.argv.slice(2)),
    https         = require('https'),
    fs            = require('fs'),
    app           = require('express')(),
    _             = require('lodash'),
    parser        = require('xmldom').DOMParser,
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    sendPostRequest = require('request').post;    

var port_location;

if(argv.port) {
  port_location= argv.port;
  console.log('using port ' + port_location);
} else {
  port_location = 8880;
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

var utils = require('./utils/sharedUtils.js');

/////////////////////////////////////////////// INITIAL PROTOCOL ///////////////////////////////////////////

app.get( '/*' , function( req, res ) {
  
  // extract from request to server (only returns worker_id for first ping) 
  var id = req.query.workerId;
  // specifics to this experiment
	var database ='task_stream';
  // dont exclude tylers 
  var repeat_workers = ['A33F2FVAMGJDGG']
  var let_pass = repeat_workers.indexOf(id) > -1

  // once HIT is accepted decide if we're going to serve the experiment
  if (id != undefined){
	  // extract collection from mturk url  
    collection = req.originalUrl.slice(1, req.originalUrl.indexOf('index.html')-1) 

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
  // let everyone see instructions if worker_id is undefined -- before accepting the HIT
  } else {
    return utils.serve_file(req, res);
  }
})


io.on('connection', function (socket) {
  socket.on('current_data', function(data) {
      console.log('current_data received: ' + JSON.stringify(data));
      writeDataToMongo(data);
  });
});

var writeDataToMongo = function(data) {
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
