function show_mturk_submit_button(){

  submit_button = document.createElement('div');
  submit_button.innerHTML = "" +
  "<div id='hidden_button' style='position: absolute; top:50%; left: 50%; '>" +
    "<form name='hitForm' id='hitForm' method='post' action=''>" +
      "<input type='hidden' name='assignmentId' id='assignmentId' value=''>" +
      "<input type='submit' name='submitButton' id='submitButton' value='Submit' class='submit_button'>" +
    "</form>" +
  "</div>"

  document.body.appendChild(submit_button);
  document.getElementById('hitForm').setAttribute('action', get_submission_url())
  document.getElementById('assignmentId').setAttribute('value', get_turk_param('assignmentId'))

}

function get_submission_url(){
  if (window.location.href.indexOf('sandbox')>0) {
      console.log('SANDBOX!')
      submission_url = 'https://workersandbox.mturk.com/mturk/externalSubmit'
  } else {
      console.log('REAL LYFE!')
      submission_url = "https://www.mturk.com/mturk/externalSubmit"
    }
  return submission_url
}

function get_turk_param( param ) {
  // worker id : 'workerId'
  // assignmen ID : 'assignmentId'
  // hit ID : 'hitId'
  var search_term = "[\?&]"+param+"=([^&#]*)";
  var reg_exp = new RegExp( search_term );
  var search_url = window.location.href;
  results = reg_exp.exec( search_url );
  if( results == null ) {
      return 'NONE'
  } else {
    return results[1];
  }
}

function format_data_for_server(trial_data, params) {
  trial_data.worker_id= get_turk_param('workerId')
  trial_data.assignment_id= get_turk_param('assignmentId')
  trial_data.hit_id= get_turk_param('hitId')
  trial_data.browser = get_browser_type()
  trial_data.collection = params.collection
  trial_data.database = params.database
  trial_data.iteration = params.iteration
  return trial_data
}
