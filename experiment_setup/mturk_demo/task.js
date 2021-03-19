/* create timeline */
var timeline = [];

/* preload images */
var preload = {
  type: 'preload',
  images: ['stimuli/blue.png', 'stimuli/orange.png']
}
timeline.push(preload);

/* define welcome message trial */
var welcome = {
  type: "html-keyboard-response",
  stimulus: "Welcome to the experiment. Press any key to begin."
};
timeline.push(welcome);

/* define instructions trial */
var instructions = {
  type: "html-keyboard-response",
  stimulus: `
    <p>In this experiment, a circle will appear in the center
    of the screen.</p><p>If the circle is <strong>blue</strong>,
    press the letter F on the keyboard as fast as you can.</p>
    <p>If the circle is <strong>orange</strong>, press the letter J
    as fast as you can.</p>
    <div style='width: 700px;'>
    <div style='float: left;'><img src='stimuli/blue.png'></img>
    <p class='small'><strong>Press the F key</strong></p></div>
    <div class='float: right;'><img src='stimuli/orange.png'></img>
    <p class='small'><strong>Press the J key</strong></p></div>
    </div>
    <p>Press any key to begin.</p>
  `,
  post_trial_gap: 2000
};
timeline.push(instructions);

/* test trials */
var test_stimuli = [
  { stimulus: "stimuli/blue.png",  correct_response: 'f'},
  { stimulus: "stimuli/orange.png",  correct_response: 'j'}
];

var fixation = {
  type: 'html-keyboard-response',
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: function(){
    return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
  },
  data: {
    task: 'fixation'
  }
}

var test = {
  type: "image-keyboard-response",
  stimulus: jsPsych.timelineVariable('stimulus'),
  choices: ['f', 'j'],
  data: {
    task: 'response',
    correct_response: jsPsych.timelineVariable('correct_response')
  },
  on_finish: function(data){
    data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
////////BEGIN MODIFICATION////////////////////////////////////////////////////////////////
    data.worker_id= get_turk_param('workerId')
    data.assignment_id= get_turk_param('assignmentId')
    data.hit_id= get_turk_param('hitId')
    save_trial_to_database(data)
    console.log('client-side data sent to server:', data)
////////END MODIFICATION//////////////////////////////////////////////////////////////////
  }
}

var test_procedure = {
  timeline: [fixation, test],
  timeline_variables: test_stimuli,
  repetitions: 5,
  randomize_order: true
}
timeline.push(test_procedure);

/* define debrief */

var debrief_block = {
  type: "html-keyboard-response",
  stimulus: function() {

    var trials = jsPsych.data.get().filter({task: 'response'});
    var correct_trials = trials.filter({correct: true});
    var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    var rt = Math.round(correct_trials.select('rt').mean());

    return `<p>You responded correctly on ${accuracy}% of the trials.</p>
      <p>Your average response time was ${rt}ms.</p>
      <p>Press any key to complete the experiment. Thank you!</p>`;

  }
};
timeline.push(debrief_block);

/* start the experiment */
jsPsych.init({
  timeline: timeline,
  on_finish: function() {
////////BEGIN MODIFICATION////////////////////////////////////////////////////////////////    
    show_mturk_submit_button()
////////END MODIFICATION//////////////////////////////////////////////////////////////////
  }
});
