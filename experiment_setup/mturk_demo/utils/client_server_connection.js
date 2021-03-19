socket = io.connect();
save_trial_to_database = function(trial_data){
  socket.emit('insert', trial_data)
}
