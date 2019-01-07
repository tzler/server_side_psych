///////////////////////////////////// EXPERIMENTAL PARAMETERS ///////////////////////////////////
// TO DO: 
// - single params dictionary 
// - cleanup 
//

var supporting_info_location = '../support/'
//console.log('block request?', block_request)
var debugging = 0

/// the number of trials we want to integrate over before moving on
var assesment_window = 30 // trials 
var accuracy_threshold = .90 // 
var mini_block_length = 2 // n_repetitions per category 
var correct_advantage = 0 // scales seconds -- closer to 1 = speeding up for correct trials
var n_trials_between_break = 100
var n_blocks = 5
var trial_period_length =  100
var experiment_length =  30 * 60 // in seconds

var break_length = 1 // minutes 
var break_trials = []; 
    for (i=1; i<11; i++) {break_trials.push(i*n_trials_between_break)}

// set criteria for ending experiment
//$.ajax({ type: 'GET', url: supporting_info_location + 'numbers.txt', dataType: 'json',
//  			 success: function(json){ set_size = json; }, 
//         async: false})

//var n_classes = set_size['possible'][(set_size.actual.length  - 1) % set_size.possible.length] 
var n_classes = 10
// for the moment it's just fixed at ten classes per experiment 

if (n_classes == undefined) { n_classes = 10; console.log('setting n_classes manually!') }

//console.log('n_classes', n_classes, set_size)
var ended_early = 0 
var n_categories_per_block = n_classes/n_blocks
var experiment_running = true;
var trial_bonus = .02
var trial_penalty = .015
//// amount of time in blank screens before and after sample image
var loading_sample_image_time = 1000 // ms 
var presentation_time = 2000
var new_category_trial = 0
var post_action_delay = 500 // ms
///// color of feedback after decision
var feedback_colors = ['red', 'blue']
var supported_browsers = ['Chrome']

/// mongo details
var mongo_database_name = 'task_stream'
var mongo_collection_name = 'stimulus_response'
var iteration_name = 'sr_rescue_pilot0_color_' + n_classes + '_classes'
var rescue_type = 'color_auto-manual-hybrid'

//// initialize experimental variables
var i_trial = 0;
var n_correct_trials = 0;
var i_block = 0
var bonus_earned = 0 
var accuracy_vector = []
var new_class_assesment_window = [] 
var old_class_assesment_window = [] 
var trial_by_trial_reward = [] 
var current_experiment_duration = 0;
var all_click_events = [] 
var n_trials_within_block = 0


// trial data to save
var trial_data  = { 'correct':[],
              		  'click_side':[], 
                    'optimal_action':[],  
              		  'trial_category':[],
                    'trial_category_name':[], 
                    'category_index':[], 
              		  'image_url':[],                
              		  'time_to_decision':[], 
								    'all_click_events':[], 
                    'action_locations':[], 
									  'imagenet_id':[], 
                    'assesment_window_accuracy':[], 
                    'i_block':[], 
                    'i_trial':[], 
                    'n_trials_within_block':[],
										'trial_color':[],                   
}

// debugging update experimental parameters
if (debugging) {
  n_blocks=debugging_blocks;
  experiment_length=debugging_length;
  n_classes=debugging_classes;
  n_trials_between_break = debugging_break_interval;
  assesment_window = debugging_assesment_window;
	n_categories_per_block = debugging_categories_per_block; 
	var break_trials = [];
    for (i=1; i<11; i++) {break_trials.push(i*n_trials_between_break)}
}

var trial_start = Date.now();
//////////////////////////// HELPER FUNCTIONS ////////////////////

function get_random_integer(max) {
  return Math.floor(Math.random() * Math.floor(max));}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;}
    return a;}

function average(numbers) {
  var sum = 0 
  for (var i = 0; i < numbers.length; i++) {
      sum += numbers[i]
  var avg = sum / numbers.length
  } return avg}

function get_box_borders(match_screen_type){
	top_ = Math.round($('#'+match_screen_type).position()['top']) 
	left_ = Math.round($('#'+match_screen_type).position()['left']) 
	right_ = Math.round(left_ + $('#'+match_screen_type).width())
	bottom_ = Math.round(top_ + $('#'+match_screen_type).height())
	center_ = {'y': Math.round(top_ + (bottom_-top_)/2), 'x': Math.round(left_ +  (right_-left_)/2)}
	box_info = {'top': top_, 'bottom': bottom_, 'left': left_, 'right': right_, 'center':center_}
	return box_info
}

////////////////////////// GENERATE BLOCK STRUCTURE ////////////////

var _classes_ = [] 
var blocks = []
var decision_structure = 'random'
var category_reward_map = {} 

_classes_ = shuffle([0,1,2,3,4,5,6,7,8,9])
var evenly_distribute_sides_within_block = 1; 

if (decision_structure == 'random'){
  //console.log('random decision structure')
  if (evenly_distribute_sides_within_block) {
    rewarded_side = [] 
    for (i=0;i<n_blocks;i++) { 
      tmp_ = Array.apply(null, Array(n_categories_per_block)).map(Number.prototype.valueOf,0);
      tmp_.fill(1, Math.round(n_categories_per_block/2), n_categories_per_block) 
      rewarded_side = rewarded_side.concat(shuffle(tmp_))}}
  else{
    rewarded_side = new Array(n_classes+1).join('0').split('').map(parseFloat)
    rewarded_side.fill(1,Math.round(n_classes/2),n_classes)
    rewarded_side = shuffle(rewarded_side)}

  for (i_category = 0; i_category < n_classes; i_category ++)  {
    category_reward_map[_classes_[i_category]] = rewarded_side[i_category] 
  }
}

new_classes = []
old_classes = []
for (ii = 0 ; ii < n_blocks; ii ++) {
	blocks[ii] = _classes_.slice(0, (ii+1)*n_categories_per_block)
	new_classes[ii] = _classes_.slice(n_categories_per_block*(ii), (ii+1)*n_categories_per_block) 
	old_classes[ii] = _classes_.slice(0, (ii)*n_categories_per_block)	
 
} 

//console.log('all blocks', blocks) 

// store for experiment
trial_data['all_classes'] = _classes_
trial_data['blocks'] = blocks
trial_data['category_reward_map'] = category_reward_map

function rainbow(numOfSteps, step) {
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

category_colors = [] 

for (i=0; i<n_classes; i++){ 
	category_colors[i] = rainbow(n_classes,i)
}

// manual override for this one super ambiguous color -- it's too close to 4
category_colors[3] = '#000000'
category_colors[6] = '#ffffff' 

/// actually, you might as well just choose all of them manually for 10 


//////////////////////////// LEARNING CURVE VISUALIZATION /////////////////////////////

function show_learning_curve(trial_data_, bonus_earned){
	
	var	plot_div_id = 'learning_curve'
	var slide_to_append_to = '.exit_slide'
	midpoint = Math.round($(window).width()/2)
	var style_details = "margin-top: 5%; transform: translateX(-50%)"
	$('<div id="' + plot_div_id + '" style="'+ style_details + '"></div>').appendTo('.exit_slide')
	$('#' + plot_div_id).css('width', '65%').css('height', '25%').css('margin-left', midpoint + 'px').css('text-align', 'center')  
  interval_trials = 10
	// extract number of blocks -- just skip any remainders at the end	
	n_blocks =  Math.floor( trial_data_.length/interval_trials )
	var x_data = [];
	var y_data = [];
 	// generate x and y data for learning curve
	for (var i = 0 ; i <  Math.floor( trial_data_.length/interval_trials ) ; ++i) 
		{ x_data.push(i);
	    tmp_ = 0; // begin to sum over the interval for this block
	    for (ii = 0; ii < interval_trials; ii++)
	      { tmp_ = tmp_ + trial_data_[i*interval_trials + ii]}
	    y_data.push(tmp_/interval_trials) // store block
	  }
			
	plot_info = [{
		x: x_data,
	  y: y_data ,
	  mode: 'lines',
	  name: 'dot',
		marker: {color: 'black'},
	  line: {
	    dash: 'dot',
	    width: 4
	  }}]
	
	  var layout = {

      title: 'Your performance across the experiment <br> Total bonus: $' + bonus_earned.toFixed(3), 
	    xaxis: {
	      title: 'time<br>(' + interval_trials + ' trial bins)',
	      showgrid: false,
	      zeroline: false,
	    },
	    yaxis: {
	      title: 'averaged accuracy',
	      showline: false, 
        range: [0,1],
	    },
	    font: {size: 15, color:'#4a1535'},
			margin: {t:100},
			paper_bgcolor:'rgba(0,0,0,0)',
			plot_bgcolor:'rgba(0,0,0,0)',
	  }
	
	  const config = { displayModeBar: false , staticPlot: true}
	
	  plot_div  = document.getElementById(plot_div_id);
	  Plotly.plot( plot_div, plot_info, layout, config);
}	

//////////////////////////////// POPULATE HTML //////////////////////////////////////////

setTimeout(function(){$('body').show()}, 500)
$(function(){$("#consent_form").load(supporting_info_location +  "consent.html");});
$(function(){$("#consent_instructions").load(supporting_info_location + 'consent_instructions.html');});
$(function(){$('#instructions_slide_one').load(supporting_info_location + 'instructions.html');});
$(function(){$('#stanford_logo').attr('src', supporting_info_location + 'stanford_logo.png')});

$('.sample_screen').css('margin-top', Math.round(window.innerHeight/2)) 
// set default reset timer message
txt1 = "Feel free to take a break for a moment; we'll stop the experimental clock."
txt2 = " To resume the experiment again, press the button below. We'll begin the clock again in " 
reset_time = break_length + ":00"
function reset_timer_screen(){$('#timer_message').html(txt1 + txt2 + reset_time)}

////////////////////////////////////////////// MANAGE ZOOM SETTINGS /////////////////////////////////////

function get_browser_type(){
  var N= navigator.appName, ua= navigator.userAgent, tem;
  var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
  M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
  ////// includes version: ////////  return M.join(' '),
  return  M[0]
};

//function disable_scroll_events() {

    // only works if we have jquery 8 
    //	$(window).on('wheel.impair', function(e) {   
    //    return false;
    //		if (e.ctrlKey) { console.log('pinch zoom', e.deltaY)}});

//$(document).bind("mousewheel", function() {
//      return false;});

//}

//function enable_scroll_events() {
      
      //  $(window).off('wheel.impair');
      // document.addEventListener('mousewheel', document);
      // document.addEventListener('DOMMouseScroll', document);

//}

// register changes in screen zoom
function get_default_zoom() {

  browser_type = get_browser_type()
  //console.log('browser_type', browser_type)
  if (browser_type == 'Firefox') 
    { default_zoom = 2} 
  if (browser_type == 'Chrome')
    { default_zoom = 2}
  if (browser_type == 'Safari')
    { default_zoom = 1}

  return default_zoom
}

// monitor resize events -- contingent on browser type -- and disrupt experiment with error message if necessary
//$(window).resize(function() {
//   
//  default_zoom = get_default_zoom()
//  error_message = 'RESET ZOOM TO 100% <br> ZOOM IS CURRENTLY SET TO ' 
//  current_magnification = Math.round((window.devicePixelRatio/default_zoom)*100) + '%'
//   
//  if (window.devicePixelRatio != default_zoom ) {
//    //console.log('wrong magnification')
//    $('#main_experiment').hide()
//    $('.window_error_message').html(error_message + current_magnification).show()
//  } else {
//    //console.log('correct magnification')
//    $('#main_experiment').show()
//    $('.window_error_message').hide()
//  }
//});
//
//////////////////////////////////// DEFINE EXPERIMENT CLICK EVENTS /////////////////////////////////////

// COLLECT ALL CLICKS THROUGHOUT THE EXPERIMENT
$(document).click(function(event){
  all_click_events.push({
                      'x':event.pageX, 'y':event.pageY, 
                      'time_from_trial_onset': (Date.now() - trial_start)/1000, 
                      'i_trial':i_trial
                    })
});

// RESUME EXPERIMENT DURING BREAK 
$('.resume').click(function() {
  $('#break_slide').hide()
  $('#main_experiment').show()
  stimulus_setup()
  //disable_scroll_events()
  experiment_running = true
})

var worker_id = 0 //GetWorkerId() 

// BEGIN EXPERIMENT 
$('.begin').click(function() {
  
  browser_type = get_browser_type() 
  // only chrome + worker must have already accepted  
  if (supported_browsers.indexOf(browser_type)>-1 && (worker_id != "NONE") ){
    $('.begin').hide();
    $('.instructions').hide();
    $('.reward_meter').show()
  	experiment_start_time = Date.now();
    trial_start = Date.now();
    experimental_clock()
    stimulus_setup()
  	//disable_scroll_events()
  	resume_clicked = 1 
    experiment_running = true;
  } 
})

// WITHIN TRIAL ACTIONS FOR COLLECTION AND DETERMINING REWARD
$('.grid-item').click(function(event){
  
  action_taken = 1
	//relative_y = Math.round(window.innerHeight/2)
  //relative_x = Math.round(window.innerWidth/2)
  relative_y = Math.round(window.innerHeight/2) - ($('.sample_screen').height()/2)
  relative_x = Math.round(window.innerWidth/2) - ($('.sample_screen').height()/2)




  //console.log(relative_x, relative_y) 
  // temporarilly disable clicks
  $(".grid-item").css("pointer-events", "none");
  // store time to decision
  trial_data['time_to_decision'][i_trial] = (Date.now() - trial_start)/1000 
  trial_data['action_locations'][i_trial] = {'x':event.pageX -relative_x, 'y':event.pageY - relative_y} 
  //console.log('action locations:', trial_data['action_locations'][i_trial])
	trial_data['all_click_events'][i_trial] = all_click_events; 
  all_click_events = [] 
  // determine whether subject took the correct action
  _correct_ = evaluate_trial(event.pageX, event.pageY)
  // change color of image according to accuracy
 
  // change color of image according to accuracy
  $('.reward_meter').css('border-color', feedback_colors[_correct_*1])
  fade_rate = 200
  setTimeout(function() {
    $('.reward_meter').css('transition-duration', '.3s')
    $('.reward_meter').css('border-color', '#C0C0C0')
  }, fade_rate ) 
  
  //if (_correct_) {
	//  $('.reward_meter').css('border-color', correct_color_trial)
  //  setTimeout(function() { 
  //    $('.reward_meter').css('border-color', '#C0C0C0')
  //  }, 200)
  //}
})

// EXPERIMENTAL CLOCK
function experimental_clock() {
  
  var experiment_clock = setInterval(function() {
    if(experiment_running) {
      current_experiment_duration++;
    }
  }, 1000);
} 

//////////////////// CALCULATE AND PRESENT ACCUMULATED REWARD DURING EXPERIMENT ///////////////////////

function display_reward(bonus_earned, trial_bonus,  trial_penalty, correct){
  bonus_earned = bonus_earned + (trial_bonus * correct) - (trial_penalty * !correct)
  bonus_earned = Math.max(bonus_earned, 0)
  $(".reward_meter").html(" <strong>BONUS AMOUNT</strong>: $" + (bonus_earned).toFixed(3))
  return bonus_earned
}

/////////////////////////// ENSURE COUNTERBALANCED CATEGORY PRESENTATION //////////////////////////////

function generate_balanced_trial_category(i_trial){
  
  mini_block_index = i_trial % (blocks[i_block].length * mini_block_length  ) 
  
  // generate new mini block if previous completed or changed
  if ( mini_block_index == 0  || mini_block_index >= mini.length){
    mini = blocks[i_block]     
    for (i=0;i<mini_block_length-1; i++) {mini = mini.concat(mini)} 
    mini = shuffle(mini); mini_block_index = 0 ; i_category = mini[mini_block_index]
  // or just draw from the one we already have
  } else { i_category = mini[mini_block_index] } 
  
  return i_category
}

/////////////////////////// ENSURE SAMPLE IMAGE HAS NOT BEEN SEE YET (BELOW n = 50) /////////////////////

function sample_unseen_image_from_category(trial_category){
  
  n_images_per_category = 50
  // create dictionary and range if necessary
  if (typeof inventory == "undefined") {inventory= {}}
  if (typeof inventory[trial_category] == "undefined" || inventory[trial_category].length == 0) 
    { inventory[trial_category] = Array.apply(null, {length: n_images_per_category}).map(Number.call, Number) }
  trial_image = inventory[trial_category].splice(inventory[trial_category].length-1) 
  return trial_image
}

////////////////////////////// CONVENIENCE DISPLAY FOR SUBJECT DURING BREAK /////////////////////

function update_break_clock( _time_total_){
  
  travel = break_length * 60 
  then = Date.now() 
  resume_clicked = 0
  txt1 = "Feel free to take a break for a moment; we'll stop the experimental clock. "
  txt2 = "To resume the experiment press the button below. We'll begin the clock again in "

  // Update the count down every 1 second
  var x = setInterval(function() {

      // Get todays date and time
      var now = Date.now()
      raw = Math.round((travel + (then - now )/1000))
      minutes = ('00' + Math.floor((raw%60)))
      // Find the distance between now and the count down date
      var distance = Math.floor((raw/60)) + ':' + minutes.substr(minutes.length-2, minutes.length)
      // Output the result in an element with id="demo"
      document.getElementById("timer_message").innerHTML = txt1 + txt2 + distance
     
      // If the count down is over, write some text 
      if (raw.toFixed(0) <= 0 || resume_clicked ) {
        clearInterval(x);
  			document.getElementById("timer_message").innerHTML = "We've restarted the experiment timer."
        experiment_running = true; 
    }
  }, 1000);
}

///////////////////////////// SETUP STIMULUS FOR NEXT TRIAL OR EXIT ///////////////////////////////

function stimulus_setup(){
  
  $('.sample_image').hide()
  //console.log(category_reward_map)
  var time_elapsed = current_experiment_duration
  
  //console.log(i_block, n_blocks, i_block == n_blocks, time_elapsed, experiment_length, time_elapsed > experiment_length)
  // check status of experiment and conclude if : blocks completed || time completed || no progress on blocks
  if (i_block == n_blocks || time_elapsed > experiment_length) {  
    
    exit_protocol() 
  
  }
  // otherwise begin stimulus presentation protocol
  else {
    
    function random_color(seed_number) {
      var color = Math.floor(0x1000000 * seed_number/1000).toString(16);
      return ('000000' + color).slice(-6);
    }


    
    trial_category = generate_balanced_trial_category(i_trial)
   	trial_image_number = sample_unseen_image_from_category(trial_category)
  	
    trial_color = category_colors[trial_category].slice(1, category_colors[trial_category].length)
    image_location = 'https://dummyimage.com/300.png/' + trial_color + '/' + trial_color
 
    // updates trial data
    trial_data['image_url'][i_trial] = image_location
    trial_data['trial_category'][i_trial] = trial_category
		trial_data['trial_color'][i_trial] = category_colors[trial_category]
   	$('.sample_image').attr('src',  image_location).attr('display', 'none').attr('id', trial_category) 
    console.log(trial_category, trial_color)  
    if (i_trial == trial_period_length & i_block == 0 ) {
      
      ended_early = 1 
      exit_protocol()

    } 


    if (i_trial == break_trials[0] && (! ended_early) ) {
      
      $('#main_experiment').hide() ; 
      $('#break_slide').show() 
      break_trials = break_trials.slice(1) ;
      //enable_scroll_events()
      reset_timer_screen()
      update_break_clock(break_length)
      experiment_running = false;
    
    } else{
      setTimeout(function() {
        /// display image 
        $('.sample_image').show()
        // enable click events
        $(".grid-item").css("pointer-events", "auto");
        // begin time keeping
  	    trial_start = Date.now(); 
        // monitor in case we need to time out
        monitor_status(trial_start); 
      }, loading_sample_image_time)
    }
  } 
}

//////////////////////////////// MONITOR TIME AND ACTIONS WITHIN EACH TRIAL //////////////////////

function monitor_status(_time_) {
  monitor_interval = 50 // ms 
  action_taken = 0 
  monitor_id = setInterval(function(){
    // time_taken = Date.now() - _time_ 
    //timed_out = time_taken > presentation_time
    //
    // 
    // if (timed_out) {
    //    evaluate_trial()
    //    clearInterval(monitor_id)
    //    stimulus_setup()
    // } 
    // else { 
    
    if (action_taken) {
      clearInterval(monitor_id)
      //time_remaining = (presentation_time - time_taken) 
      //corrected_time = time_remaining / (1 + correct_advantage* trial_data['correct'][i_trial-1])
      setTimeout(function(){stimulus_setup()}, post_action_delay) 
    }
  }, monitor_interval)
}

//////////////////////////////// EVALUATE PERFORMANCE--OR LACK OF RESPONSE /////////////////////////

function evaluate_trial(_x_, _y_){
  
  if (typeof _x_ == 'undefined') {
    trial_data['correct'][i_trial] = 0
    trial_data['click_side'][i_trial] = undefined} 
  else{
    // determine whether agent made the optimal choice
    decision_boundary = get_box_borders(trial_category)['center']['x']
    trial_data['correct'][i_trial] = _x_ > decision_boundary == category_reward_map[trial_category]
    // determine side of click
    decision_boundary = get_box_borders(trial_category)['center']['x']
    if ( _x_ > decision_boundary ) { trial_data['click_side'][i_trial] = 'right'}
    if ( _x_ < decision_boundary ) { trial_data['click_side'][i_trial] = 'left'}}

  trial_data['optimal_action'][i_trial] = ['left', 'right'][category_reward_map[trial_data['trial_category'][i_trial]]] 
  
  // update running inventory of general performance 
  n_trials_within_block = n_trials_within_block + 1
  n_correct_trials = n_correct_trials + trial_data['correct'][i_trial];
  accuracy_vector.push(trial_data['correct'][i_trial])
  // update inventory for only new classes in this block
  if ( new_classes[i_block].indexOf(trial_data['trial_category'][i_trial]) > -1 ) { 
    new_class_assesment_window.push(trial_data['correct'][i_trial]) 
    new_category_trial = 1    
  }
  trial_by_trial_reward.push(trial_data['correct'][i_trial]) 
 
	if (old_classes[i_block].indexOf(trial_data['trial_category'][i_trial]) > -1 ) {
		old_class_assesment_window.push(trial_data['correct'][i_trial])
    new_category_trial = 0
   	if (old_class_assesment_window.length > assesment_window) {
    	old_class_assesment_window.splice(0,1)
    }
  }

 
  // update reward value in display 
  bonus_earned = display_reward(bonus_earned, trial_bonus,  trial_penalty, trial_data['correct'][i_trial]) 
  // cut off oldest trial to preseve assesment window length
  if (accuracy_vector.length > assesment_window) { accuracy_vector.splice(0,1)} 
  if (new_class_assesment_window.length > assesment_window) {new_class_assesment_window.splice(0,1)}

  trial_data['assesment_window_accuracy'][i_trial] = {'all_class_accuracy': average(accuracy_vector), 
                                                      'new_class_accuracy': average(new_class_assesment_window), 
 																											'old_class_accuracy': average(old_class_assesment_window), 
																											} 
 
  trial_data['n_trials_within_block'][i_trial] = n_trials_within_block
  trial_data['i_trial'][i_trial] = i_trial
  trial_data['i_block'][i_trial] = i_block
  
	// save trial to database
  save_trial_to_database(trial_data, i_trial)

  // determine whether to move to the next block based on overall as well as new category accuracy
  n_trials_met = new_class_assesment_window.length == assesment_window 
  overall_accuracy_met = average(accuracy_vector) > accuracy_threshold
  new_category_accuracy_met = average(new_class_assesment_window) > accuracy_threshold
  criteria_for_concluding_block_met = n_trials_met && overall_accuracy_met  && new_category_accuracy_met 
  
if ( criteria_for_concluding_block_met ){
    //console.log('block change! old block:', blocks[i_block], 'new block:', blocks[i_block+1], 'i_block:', i_block)
    i_block = i_block + 1; accuracy_vector = []; new_class_assesment_window = []  ; n_trials_within_block = 0; 
  }
  
  // move on to next trial
  i_trial = i_trial + 1
  
  return trial_data['correct'][i_trial-1]
}

//////////////////////////////////// EXIT PROTOCOL /////////////////////////////////////

$('#submitButton').click(function(){

  current_data = {
    data_type: 'worker_feedback',
    worker_input: document.getElementById("worker_input").value,
    dbname: mongo_database_name,
    colname: mongo_collection_name,
    iteration_name: iteration_name,
    rescue_type: rescue_type, 
    n_block: i_block,
    n_trials: i_trial,
    total_bonus_earned: bonus_earned,
    n_trials_performance_cutoff: trial_period_length,
    final_accuracies: trial_data['assesment_window_accuracy'][i_trial-1],
    experiment_duration: current_experiment_duration/60,
    worker_id: GetWorkerId(),
    assignment_id: GetAssignmentId(),
    hit_id: turkGetParam( 'hitId', "NOPE" ),
  }
  socket.emit('current_data', current_data);
})


function exit_protocol(){

   // calculate % correct and assign bonus
  $('.sample_screen').hide()
  time_since_hide = Date.now()
  trial_data['percent_correct'] = (n_correct_trials / i_trial)
  // make submit button visible
  $('#submitButton').show()
  $('.exit_slide').show()
  $('.reward_meter').css('margin-left','100px') 
  show_learning_curve(trial_by_trial_reward, bonus_earned)
  //enable_scroll_events()
  trial_data['experiment_duration_seconds'] = (Date.now() - experiment_start_time)/1000
  console.log('total time of experiment, in minutes: ', trial_data['experiment_duration_seconds'] / 60)
  // mongo save
  save_trial_to_database(trial_data, i_trial)
  save_experiment_to_database(trial_data)
  // mturk save -- just for fun, we'll never use it
  document.getElementById("submit_all_data").value = JSON.stringify(trial_data)
  //}
}

/////////////////////////////////// SAVE FUNCTIONS //////////////////////////////////////

function save_trial_to_database(trial_data, i_trial){
	
	current_data = {
    
    // decision info
    correct: trial_data['correct'][i_trial],
    action_location: trial_data['action_locations'][i_trial], 
  	time_to_decision:  trial_data['time_to_decision'][i_trial],
	  click_side: trial_data['click_side'][i_trial], 
    optimal_action: trial_data['optimal_action'][i_trial],  

    // experiment info  
    i_trial: i_trial,
    i_block: i_block, 
    n_trials_within_block: n_trials_within_block,  
		all_click_events: trial_data['all_click_events'][i_trial],
    data_type: 'single_trial',
    current_experiment_duration: Math.round((new Date() - experiment_start_time)/1000),
    date_time: new Date().toString(),
    new_category_trial: new_category_trial, // xxxxxxxxx //   
    learning_cutoff: trial_period_length, 

    // reward related info 
    assesment_window_accuracy: trial_data['assesment_window_accuracy'][i_trial], 
    trial_bonus: trial_bonus,  
    bonus_earned: bonus_earned,  

    // stimulus info 
    category_index: trial_data['trial_category'][i_trial],
    category_name: trial_data['trial_category_name'][i_trial], 
    within_experiment_category_index: trial_data['category_index'][i_trial],  
	  image_url: trial_data['image_url'][i_trial],
		imagenet_id: trial_data['imagenet_id'][i_trial],  
    box_info: {'stimulus': get_box_borders(trial_category), 'stimulus_height':$('.sample_screen').height()}, 

    // mongo markers
    dbname: mongo_database_name,
    colname: mongo_collection_name,
    iteration_name: iteration_name, 
    rescue_type: rescue_type, 

    // mturk info
    context: submission_type,
    worker_id: GetWorkerId(),
    assignment_id: GetAssignmentId(),
    hit_id: turkGetParam( 'hitId', "NOPE" ),
    browser: browser_type,

  }
  
  // send data to server to write to database
  socket.emit('current_data', current_data);
	//console.log(current_data)
  }

function save_experiment_to_database(trial_data){
    
  current_data =
      {
      data_type: 'experiment_summary',
      ended_experiment_early: ended_early, 
      // mono tags
      iteration_name: iteration_name, 
      rescue_type: rescue_type, 
      dbname: mongo_database_name,
      colname: mongo_collection_name,
      
      // experiment bolus
      experimental_data: trial_data,
      total_experiment_time: (new Date() - experiment_start_time)/1000,

      // bonus info 	
      bonus_earned:bonus_earned,  
      
      // mturk
      mturk_platform: submission_type,
      worker_id: GetWorkerId(),
      assignment_id: GetAssignmentId(),
      hit_id: turkGetParam( 'hitId', "NOPE" ),
      
      browser: browser_type, 
      decision_time: 'unlimited',
		};
    // send data to server to write to database
    socket.emit('current_data', current_data);
    //    console.log('experiment saved to database')
    //console.log(current_data)
}

//////////////////////////////////////////////// NODE ////////////////////////////////////////////

paper.install(window);
socket = io.connect();

////////////////////////////////////////////// MTURK //////////////////////////////////////////////
	
	// this actually doesn't work ... it's always going to mturk ... 
  // set submission type
  if (window.location.href.indexOf('sandbox')>0)
    {submission_type = 'sandbox'}
  else
    {submission_type = 'mturk'}
    // make a third option here
  
  // toggle submission url depending on submission_type
  if (submission_type === 'sandbox')
    { submission_url = 'https://workersandbox.mturk.com/mturk/externalSubmit'}
  else
    { submission_url = "https://www.mturk.com/mturk/externalSubmit"}
  // functions to extract mturk info to store
  function GetWorkerId()
    { workerId = turkGetParam( 'workerId', 'NONE' );
      return workerId;}
  function GetAssignmentId()
    { assignmentId = turkGetParam( 'assignmentId', 'NONE' );
      return assignmentId;}
  function turkGetParam( name, defaultValue )
    { var regexS = "[\?&]"+name+"=([^&#]*)";
      var regex = new RegExp( regexS );
      var tmpURL = window.location.href;
      results = regex.exec( tmpURL );
      if( results == null ) {
        return defaultValue;}
      else {
        return results[1];}}
  function get_HIT_id()
    {   var regexS = '(?<=tasks/).*?(?=assignment)';
        var regex = new RegExp( regexS )
        var tmpURL = window.location.href
        var results = regex.exec( tmpURL )
        if( results == null ) {
          return 'NONE';}
        else {
          tmp = results[0]
          return tmp.substring(0, tmp.length - 1);}}

  // set mturk details from the values we've extracted/will extract
  document.getElementById('hitForm').setAttribute('action', submission_url)
  //console.log('submission_url ', submission_url )//'assignment_id', GetAssignmentId()) 
  $('#assignmentId').val(GetAssignmentId());
  $('#workerId').val(GetWorkerId());
