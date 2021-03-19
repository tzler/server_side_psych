## Integrating server side tools with a demo experiment

This folder contains scripts and illustrate how to adapt your own experiments to utilize the server side functions contained in this repository. 

There are only several lines of code that need to be added to your current scripts. To illustrate this, we've taken an minimal approach to modifying a [demo reaction time experiment](https://www.jspsych.org/tutorials/rt-task/) implimented in a popular javascript-based library for designing experiments (**`jsPsych`**). 

### 1. Installing dependencies in directory

First, let's clone the jsPsych repository: 

```
$ git clone https://github.com/jspsych/jsPsych.git jspsych-6.3.0
```

initialize our node package manager in this directory: 

```
$ npm init --yes
```

and install the dependencies we'll need 

```
$ npm install express mongodb assert https socket.io minimist
```

Now we're ready to integrate our server-side tools with this simple experiment. 

### 2. Integrating client side javascript with node 

node's `socket.io` is going to communicate across client-server platforms by "listening" for and "emitting" events. For the most part, the server is going to listen and the client will emit. 

For example, when you run `node app.js` in the command line, node is going to open a server on a prespecified port and listen with `socket.io`. The client has to connect with this same socket. 

We initiate this connection by using the header in the client's HTML. Most commonly this is in index.html (`index.html:9`) which is essentially: 

```
<head>
  <script type="text/javascript" src="./socket.io/socket.io.js"></script>
</head>
```

Because app.js is running in the same folder as index.html, we direct the client to the current working directory with `./socket.io/socket.io.js`, but could also move up the directory using `../socket.io/socket.io.js`, etc. 

Next, we just need one line of code to connect this node-based socket to client side javascript. In the spirit of being minimilly invasive, we've done this by adding the following line of code into `demo-simple-rt-task.html:18` (i.e. at line 18): 

```
socket = io.connect();
```

Now we can create a javacsript-based function that will call this node process (`demo-simple-rt-task.html:19-20`): 

```
save_trial_to_database = function(trial_data){
	socket.emit('insert', trial_data)
}
```

The function `save_trial_to_database()` sends `trial_data` to the server. node is listening for the `insert` tag and has a pre-defined protocol for inserting that data into the database. 

We can call this function whenever we'd like; we've chosen to do this at the end of each trial. In jsPsych this can be implimented by modifying the `on_finish` callback function (`demo-simple-rt-task.html:91`), which is simply:  

```
on_finish: function(data){
  save_trial_to_database(data)
}
```

### 3. Opening server to run experiment

In this folder you can run 

```
$ node app.js
```

and enter `https://<your_domain_name>:8888/index.html` into your browser. Throughout the experiment you can see some of the server and client side processes printed for clarity, in the terminal and console, respectively.

Of course, it's seldom the case that you'll want to keep these terminals open, manually, while you're collecting data. [tmux](https://linuxize.com/post/getting-started-with-tmux/) can be really usefull here, and it should already be installed on the server. We'll use tmux to 1) open a tmux session, 2) run some code (i.e. `node app.js`), then 3) detaching from the session. This ensures that the code will continue running even if we get disconnected from the server. And at any point we can also jump back in (i.e. reattach) to that session 

Let's start by opening up a session---and let's be explict and number this session (`0`), in case we ever want to create multiple tmux sessions: 

```
$ tmux attach-session -t 0
```

The terminal aesthetics should change color. Now you can enter 

```
$ node app.js
```

You can stay with this window open if you want, or detach with `Ctrl-b` + `d`. At any point you can reattach to the session and see what's going on. Or you you're free to detach and continue working in this terminal. Critically, you can detach from your session, log off of the server, and then go do something else for the day while your server stays open in the background :)


```
$ https://stanfordmemorylab.com:8888/index.html
``` 
