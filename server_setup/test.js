const http = require("http");
const test_port = 8888

// create a server on 'test_port'
const open_port = http.createServer(function (request, response) {
  // Send the response body as "Hello World"
  response.end('Great! NodeJS is running on your server :)\n');
  console.log(':::server received client\'s request:::')
})
  
open_port.listen(test_port);
// Console will print the message
console.log('\n\tServer running at http://<YOUR.IP.ADDRESS>:8888/\n');
