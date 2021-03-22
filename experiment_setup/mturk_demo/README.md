## Integrating server side tools with a practical applications: mturk data collection with an exclusion criterion

### _Overview_ 

This folder contains scripts that integrate the read-write functionality from `hello_world` within the`jsPsych_demo` experimental framework. We'll do this using the most common online crowd-sourcing platform, Amazon's Mechanical Turk (i.e. mturk). 

Basically, when someone logs into the experiment, we're going to have the server check whether this participant has already completed any trials in this experiment. If they have, they are redirected to a "Sorry, you can't continue" web page that politely explains that they cant perform this experiment again. If a subject _hasn't_ performed this experiment before, the experiment proceeds just like `jsPsych_demo`, saving their trial-by-trial data to the server. 

This is going to require that you have an mturk account. Specifically, we're going to be using a really, really useful set of command line tools that enables us to automatically generate and submit these experiments. While an intro to mturk is outside of the purview of this tutorial, let's just say that automating this submission process is better for everyone online---experimentalists and participants. 

For this automated process you'll just need one thing: your AWS credentials, which includes your `access_key_id` and  `secret_access_key`. You can find instructions under ["Programmatic Access" here](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html) if you have an account but don't yet have access to these personal credentials. 

Once you understand the moving parts in this section, you'll be able to use these same tools on other crowdsourcing platforms with simple modifications, and extend out into other server-client interactions. 

### Setting up your server-side tools
 
First, let's go over the things thave haven't changed much between this folder and `jsPsych_demo`. Again, we use the [demo reaction time experiment](https://www.jspsych.org/tutorials/rt-task/) implimented in **`jsPsych`**. As in that folder, you'll need to go through all the steps outlined in the `jsPsych_demo/README`, which we're including here: 

```
$ git clone https://github.com/jspsych/jsPsych.git jsPsych
$ npm init --yes
$ npm install express mongodb assert https socket.io minimist
```

### Refactoring our code 

while the code's function is the same up till this point, we've made some design changes in how our code is organized. As you might notice if you look over the files in this folder, we've "factored out" different javascript-based functions from the the html code---that is, we've separated each of the moving parts. Now we have a single, simple `index.html` file that contains pointers to all the relevant code that's used for different parts of the experiment, which looks like this: 

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

Previously, we were importing the `jsPsych` and `socket.io` libraries. Now, we're also importing our own custom functions (basically, mini-libraries): 

- `utils/client_server_connection.js` a tiny script that sets up the connection to the socket 
- `task.js` contains the experimental backbone that sets up the trials, stimuli, instructions, etc. 

Why go through all this trouble? A bunch of reasons. First, it makes it easier to debug issues that come up; error messages will be easier to trace back to their source. Second, it makes it easier to reuse code across multiple experiments; once you've got things working right, you can just copy and paste the files and not worry that things are changing as you maneuver through the script. Finally---and as importantly!---it also makes it easier for other people to understand your code :)   

Aside from these design decisions, we're also gearing up to interface with mturk. We've included all the mturk-related functions in this additional script:

- `utils/mturk_functions.js` contains functions related to the mturk interface

These functions are going to let us collect participant-related information that is necessary to pay workers (i.e. `workerId`, `assignmentId`) as well as send confirmation of experiment completion back to mturk's servers. You don't have to pay attention to any of these details---everything will work as is :) 

## Setting up your MTURK dependencies

We've included a simple script that will let you submit experiments on mturk---or, as they're often called "HITs", for Human Intelligence Tasks. To submit HITs via this command line interface, you'll have to use your mturk requester account credentials through, which we mentioned above. 


Once you have your `access_key_id` and your `secret_access_key`, go into the `credentials/` folder and create a json file named `aws_keys.json` with the following formatting: 

```
{
"access_key_id": "<YOUR_ACCESS_KEY_ID",
"secret_access_key" :"YOUR_SECRET_KEY_ID"
}
```

When you're done, you should have the following file at the following location: `server_side_psych/experiment_setup/credentials/aws_keys.json`.

### _Code that's going to be useful for debugging:_ 

Now, the functionality of the server here will be to redirect participants that have already encoutered the experiment using each participants worker ID. This means it will also prohibit you from viewing the experiment more than once. Because you'll typically be troubleshooting your code before launching it in the "sandbox", we've made sure that you can give yourself the ability to see the experiment multiple times. To do this, you'll need to know your mturk `workerId`. (If you don't know your workerId, it's in the upper left-hand corner of the browser when you're logged onto the sandbox.) 

You can save a file in the `credentials/` folder that contains _only_ your workerId--no quotes, no labels. The file should be named `my_worker_id` and look like this:

```
A33F2FVXMGJDMM
```

When you're done, you should have the following file at the following location: `server_side_psych/experiment_setup/credentials/my_worker_id`.

## Verifying participation by quering the database with "workerId" 

Great. Let's reiterate our general idea: Each time someone opts in to perform your experiment, you check whether they have already participanted in this study; if they _haven't_, the experiment proceeds as normal, if they _have_ they get redirected to an explanation of why they aren't allowed to participate. We'll use a unique identifier that each participant has on mturk---their `workerId`---throughout this process.

How can evaluate whether someone has previously participanted in this experiment? This is done mostely on the server with node in `app.js`. Here we'll just sketch out the approach and leave you to go through this in detail on your own time; when you're ready to get into the specifics, you can look over the line-by-line comments in `app.js` to talk you through each step. 

There's really one, high-level difference between this `app.js` file and the one in previous demos. Previously, every document that each client (i.e. each experimental participant, via their web browser) requests from the server was "served" to them (i.e. data on the server was sent to their browser). In this section we introduce a protocol that, before "serving" any files to the client, asks "Has this participant been here before?" This protocol begins in `app.js:46-49`: 

```
// listen to incoming requests
app.get('/*', function (req, res) {
  // server distribution protocol
  initialization(req, res)
});
```

When `initialization():129` is defined below, this function first checks whether there is a worker ID. This will only happen with two conditions are met: The participant is viewing this experiment on mturk _and_ they have "accepted the HIT" (i.e. have chosen to complete the experiment). If these conditions aren't met (e.g. someone hasn't accepted the HIT, or they're not on mturk), all the files are served to the participant with `serve_file()`. 

_`ETHICAL NOTE`_ On mturk, you're not just a scientist, you're also an employer. People depend on this as a source of income: it's work. How you design your experiments should respect this fact. In this specific moment, that means that we do everything we can to let people know what the experiment (i.e. their working conditions) is going to be like. This let's them freely consent to participante. And so while we _could_ design the server to only show subjects example stimuli _after_ they have accepted the HIT (i.e. the first see the stimuli when they're in the experiment) this design can be coercive,[especially considering the balance of power between participants and experimentalists](https://www.theatlantic.com/business/archive/2018/01/amazon-mechanical-turk/551192/). We strongly discourage this approach. 

If the server detects an mturk worker ID, it checks whether they have already performed this experiment using `get_previous_participation():169`. This function searches within the given database and collection for any instance of this participants worker ID. If their worker ID is not found, they are again allowed to proceed---that is, they are served all the files they request. If their worker ID is found, `handle_duplicate():169` redirects the participant to a different page. Here, they are informed why they won't be able to complete this HIT, reminded that they can reach out to the experimenter if they believe they have been brought here in error, and kindly instructed to "return the HIT" so that other participants can complete this experiment.

## Collecting and saving MTURK-related information across the experiment. 

Now, we still want to save this data on every trial. Let's start by looking at how we do this, which is relatively straightforward: using functions defined in `mturk_functions.js`, we collect the mturk data in just a few lines of code, then send it to the server, just like we did in the `jsPsych` demo. Specifically, these lines of code are in `task.js:68-71`: 

```
data.worker_id= get_turk_param('workerId')
data.assignment_id= get_turk_param('assignmentId')
data.hit_id= get_turk_param('hitId')
save_trial_to_database(data)
```

Additionally, we've got to send a signal back to mturk when subjects have completed the experiment. For participants, this is the single most important thing in our experiment---it makes sure they are able to get paid! Again, calling functions in `mturk_functions.js` we can accomplish this with just a single well positioned line of code in  `task.js:109`, displaying  mturk's "Submit" button at the end of the experiment by just adding `show_mturk_bottom()` within jsPsych's `on_finish()` function: 

```
jsPsych.init({
  timeline: timeline,
  on_finish: function() {
    show_mturk_submit_button()
  }
})
```

Because we've factored out the mturk and socket functions, adding these several lines of code is all you need to do to make _any_ javascript-based experiments compatible with the server-side resources we've been developing, and now the mturk compatibility.  

### Setting up your python environment :snake: 

It's possible to manually submit HITs to mturk, but it's error prone and tedious. So we're going to automate this process, using python from the command line instead. Let's start by setting up our python environment to make this easy for us.

First, let's just make sure that our global environment is up to date

```
$ sudo apt update
```

and then 

```
$ sudo apt -y upgrade
```

If you're asked any questions about which settings to use, just enter `N`. 

Now we're going to need to install a package that will let us submit experiments to mturk. Let's use `pip` for this installation. But we'll need to install pip first. We can take care of with the following command: 

```
$ sudo apt install -y python3-pip
```

Great. Now we can install `boto3` which will let us interface with mturk via the command line: 

```
$ pip3 install boto3 
```

Now we should be ready to submit our experiment to mturk--i.e. post it online :) 

## Submiting experiments to MTURK

We're going to use the following script to submit HITs: `server_side_psych/experiment_setup/mturk_demo/submit_hit.py`. The only thing this script needs you to do is what's been outlined above (generating the `aws_keys.json` and `my_work_id` files in the `credentials/` folder). There are a _looooot_ of details in this script; you can ignore them all for now, but if you'd like to adopt this approach there are line-by-line comments throughout which should be helpful.  

We call this script from the command line by passing it arguments in the following way: if we want to submit 5 HITS (i.e. have 5 people complete this experiment) and pay them each 10$, then we would use the following command: 

```
$ python3 submit_hit.py sandbox 5 10
```

Notice that we're using `python*3*`. It wil ask you to confirm: 

```
Create 5 sandbox HITs for $10 each?


(yes/no)
```

After typing `yes` and pressing `ENTER` the script will generate a short lived experiment in the sandbox. It was also  print out the following: 

```
HIT_ID: 3IKMEYR0LYBQV7KGG5GLI4SBEFTK2D
which you can see here: https://workersandbox.mturk.com/mturk/preview?groupId=3T1XT3I8SZK70AASREU8F5MMJ0K6HO
```

You can copy and paste the URL above to access the experiment in the sandbox! 
