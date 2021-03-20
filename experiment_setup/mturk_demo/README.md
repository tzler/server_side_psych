## Integrating server side tools with a more practical applications: mturk data collection

This folder contains scripts that integrate the read-write functionality from `hello_world` within the`jsPsych_demo` framework. Specifically, with someone logs into the experiment, the server checks whether they have completed any trials in this experiment previously; if they have, they are redirected to a "You can't continue" web page that politely explains that they cant perform this experiment again. If a subject _hasn't_ performed this experiment before, the experiment proceeds just like `jsPsych_demo`, saving their trial-by-trial data to the server. 

Because this is designed for mturk, you'll need two things 

- your AWS credentials--i.e. your `access_key_id` and  `secret_access_key`
- your mturk `workerId`
 
First let's go over the things thave haven't changed much between this folder and `jsPsych_demo`. Again, we use the [demo reaction time experiment](https://www.jspsych.org/tutorials/rt-task/) implimented in **`jsPsych`**. Again, you'll need to go through all the steps  outlined in the `jsPsych_demo/README`, i.e.:  

```
$ git clone https://github.com/jspsych/jsPsych.git jsPsych
$ npm init --yes
$ npm install express mongodb assert https socket.io minimist
```

### Refactoring our code 

while the code's function is the same up till this point, we've made some design changes in how our code is organized. As you might notice if you look over the files in this folder, we've "factored out" different javascript-based functions from the the html code---that is, we've separated each of the moving parts in ways that made the code more modular. Now we have a single, simple `index.html` file that contains pointers to all the relevant code that's used for different parts of the experiment, which looks like this: 

```
<!DOCTYPE html>
<html>
  <head>
    <title>basic mturk example</title>
    <script src="jsPsych/jspsych.js"></script>
    <script src="jsPsych/plugins/jspsych-survey-text.js"></script>
    <script src="jsPsych/plugins/jspsych-html-keyboard-response.js"></script>
    <script src="jsPsych/plugins/jspsych-image-keyboard-response.js"></script>
    <script src="jsPsych/plugins/jspsych-preload.js"></script>
    <link href="jsPsych/css/jspsych.css" rel="stylesheet" type="text/css"></link>
    <script type="text/javascript" src="./socket.io/socket.io.js"></script>
    <script src="utils/client_server_connection.js"></script>
    <script src="utils/mturk_functions.js"></script>
    <script src='task.js'></script>
  </head>
  <body></body>
</html>
```

Previously, we were importing the `jsPsych` and `socket.io` libraries. We've just done that for everything else now, too: 

- `utils/client_server_connection.js` a tiny script that sets up the connection to the socket 
- `utils/mturk_functions.js` contains functions related to the mturk interface (e.g. getting `workerId`)  
- `task.js` contains the experimental backbone that sets up the trials, stimuli, instructions, etc. 

Why go through all this trouble? A bunch of reasons. First, it makes it easier to debug issues that come up; error messages will be easier to trace back to their source. Second, it makes it easier to reuse code across multiple experiments; once you've got things working right, you can just copy and paste the files and not worry that things are changing as you maneuver through the script. Finally---and as importantly!---it also makes it easier for other people to understand your code :)   

Aside from these design decisions, the big difference is that now we're getting ready to interface with mturk. We need to set up a couple of things in preparation. 

## Setting up MTURK dependencies

We've included a simple script that will let you submit experiments on mturk (in batches of nine :wink:), though you're certainly welcome to use any scripts you like for this. To use the scripts we've offered, you'll need to link up with your amazon requester (i.e. AWS) account. To do this, create a json file named `aws_keys.json` that has your AWS credentials using this formatted : 

```
{
"access_key_id": "<YOUR_ACCESS_KEY_ID",
"secret_access_key" :"YOUR_SECRET_KEY_ID"
}
```

You'll need to put that file here: `server_side_psych/experiment_setup/credentials/aws_keys.json`. Then you can submit hits through the command line in the following way; Let's say you want to submit 3 sandbox HITs at 7$ each, just run the following code after you `cd` into the `utils/': 

Now, the functionality of the server here will be to redirect participants that have already encoutered the experiment. This means it will also prohibit you from viewing the experiment more than once. Because you'll typically be troubleshooting your code before launching it, we've made sure that you can give yourself the ability to see the experiment multiple times. To do this, you'll need to know your mturk `workerId`. 

If you don't know your workerId, it's in the upper left-hand corner of the browser when you're logged onto the sandbox. Save a file in the credentials folder that contains _only_ your workerId--no quotes, no labels. The file should be named `my_worker_id` and look like this:

```
A33F2FVXMGJDMM
```

## Verifying participation by quering the database with "workerId" 

Great. Let's reiterate our general plan: 1) submit an experiment (a HIT) onto the sandbox, 2) each time someone (probably just you for now :)) decides to perform the experiment, you collecing each their `workerID` as well as other mturk-related data, 3) you check whether they have already participanted in this study, 4) if they _haven't_ the experiment proceeds as normal, if they _have_ they get redirected. 

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

## Collecting and saving MTURK-related information across the experiment. 

Now, we still want to save this data on every trial. Let's start by looking at how we do this, which is relatively straightforward: using functions defined in `mturk_functions.js`, we collect the mturk data in just a few lines of code, then send it to the server, just like we did in the `jsPsych` demo. Specifically, these lines of code are in `task.js:68-71`: 

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

## Submiting experiments to MTURK

Then if you want to submit 3 sandbox HITs at 7$ each, for example, just run the following code in `utils/': 

```
$ python submit_hit.py sandbox 3 7
```

It wil ask you to confirm 

```
Create 3 sandbox HITs for $7 each?


(yes/no)
```

After typing `yes` and pressing `ENTER` the script will generate a short lived experiment in the sandbox. It was also  print out the following: 

```
HIT_ID: 3IKMEYR0LYBQV7KGG5GLI4SBEFTK2D
which you can see here: https://workersandbox.mturk.com/mturk/preview?groupId=3T1XT3I8SZK70AASREU8F5MMJ0K6HO
```

You can copy and paste the URL above to access the experiment in the sandbox! 
