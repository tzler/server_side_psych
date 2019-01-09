// from index.html: <script src="/socket.io/socket.io.js"></script>
socket = io.connect();

// click from index.html calls 'mongo_insert()'
function mongo_insert(){
  // extract client side text input
  var text_input = document.getElementById('text_input').value
  // log in browser 
  console.log('client side text input received:\n', text_input)
  // send to node which is listening for 'insert' and data
  socket.emit('insert', text_input)
 }

// click from index.html calls 'mongo_extract()'
function mongo_extract(){
  // send a request to node, which is listening for 'extract'
  socket.emit('extract')
}

// listen for an event called 'return_document_from_database'
socket.on('return_document_from_database', function(data) {
  // log data we've received on the client side
  console.log('client side mongo document received:\n:', data)
  // update text field in element with id 'db_return'
  document.getElementById('db_return').innerHTML = JSON.stringify(data)
})
