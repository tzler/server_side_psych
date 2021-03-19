## Integrating server side tools with a demo experiment

This folder contains scripts that integrate the read-write functionality from `hellow_world` within the`jsPsych_demo` framework. Specifically, with someone logs into the experiment, the server checks whether they have completed any trials in this experiment previously; if they have, they are redirected to a "You can't continue" web page that politely explains that they cant perform this experiment again. If a subject _hasn't_ performed this experiment before, the experiment proceeds just like `jsPsych_demo`, saving their trial-by-trial data to the server. 

First let's go over the things thave haven't changed much between this folder and `jsPsych_demo`. Again, we use the [demo reaction time experiment](https://www.jspsych.org/tutorials/rt-task/) implimented in **`jsPsych`**. Again, you'll need to go through all the instructions that are already outlined in the `jsPsych_demo/README`. While the code's function is unchanged, we've made some design changes, factoring out different javascript-based functions from the the html. Now we have a single, simple `index.html` file that contains pointers to all the relevant code that's used for different parts of the experiment. That is, in addition to having an html file that pulled together `jsPsych` and `socket.io` libraries, now we've factored out  

- `utils/client_server_connection.js` a simple script that sets up the connection to the socket
- `utils/mturk_functions.js` contains functions related to the mturk interface 
- `task.js` contains the experimental backbone that sets up the trials, stimuli, instructions, etc. 

This makes it easier to debug issues, and reuse code across multiple experiments after you've got things working right. It also makes it easier for other people to understand your code :)   

Aside from these design decisions, the big difference here is that now we're interfacing with mturk. Specifically, we're collecing each participants `workerID` as well as other mturk-related data that's necessary for paying participants for their time. And of course we want to save this data on every trial, which we do in by calling functions from `mturk_functions.js` with just a few lines of code in `task.js:68-71`: 

```
data.worker_id= get_turk_param('workerId')
data.assignment_id= get_turk_param('assignmentId')
data.hit_id= get_turk_param('hitId')
save_trial_to_database(data)
```

Additionally, we've got to send a signal back to mturk when subjects have completed the experiment. Again, calling functions in `mturk_functions.js` we can accomplish this with just a single well positioned line of code in  `task.js:109`, displaying  mturk's "Submit" button at the end of the experiment: 

```
jsPsych.init({
  timeline: timeline,
  on_finish: function() {
    show_mturk_submit_button()
  }
})
```

Because we've factored out the mturk and socket functions, adding these several lines of code is all you need to do to make any javascript-based experiments compatible with the server-side resources we've been developing, and now the mturk compatibility. 


Now let's focus on how we can evaluate whether someone has previously participanted in this experiment. This is done entirely with node in `app.js`. Here we'll just sketch out the approach and leave you to go through this in detail on your own time; we've included line-by-line comments to talk you through each step. 

There's really one, high-level difference between this `app.js` file and the one in previous demos: instead of "serving" every document that the client (i.e. experimental participants, via their web browser) requests from the server, here we introduce a protocol that asks "Have this participant been here before?" before doing anything. This begins in `app.js:46-49`: 

```
// listen to incoming requests
app.get('/*', function (req, res) {
  // server distribution protocol
  initialization(req, res)
});
```

Here, `initialization():129` first checks whether there is a worker ID. This will only happen with two conditions are met: The participant is on mturk _and_ they have "accepted the HIT". If these conditions aren't met (e.g. someone hasn't accepted the HIT, or they're not on mturk), all the files are served to the participant with `serve_file()`. Of course there are more restrictive ways to do this (e.g. prevent participants from viewing even a _single trial_ before they've accepted the HIT), but we woudn't recommend those without substantially changing this experimental design. As is, restricting participants from seeing even a single trial doesn't give them a chance to see what the experiment is about, which---given mturk and requester's generally abusive labor practices---borders on unethical. 

If the server detects an mturk worker ID, and it checks whether they have already performed this experiment `get_previous_participation():169`: this function searches within the given database and collection for any instance of this participants worker ID. If their worker ID is not found, they are again allowed to proceed. If their worker ID is found, `handle_duplicate():169` redirects the participant to a different page where they are informed why they won't be able to complete this HIT, reminded that they can reach out to the experimenter if they believe they have been brought here in error, and kindly instructed to "return the HIT" so that other participants can complete this experiment.




