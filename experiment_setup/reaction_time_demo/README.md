## Integrating server side tools with a demo experiment

This folder contains scripts and illustrate how to adapt your own experiments to utilize the server side functions contained in this repository. 

There are only several lines of code that need to be added to your current scripts. All of these details below use a [demo reaction time experiment](https://www.jspsych.org/tutorials/rt-task/) implimented in **`jsPsych`**. For clarity, we've factored out the javascript from the html so we have `index.html` and `functions.js` files instead of just one file containing everything. 

### 1. Installing dependencies in directory

First, let's clone the jsPsych repository: 

```
$ git clone https://github.com/jspsych/jsPsych.git jsPsych
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

Next, we just need one line of code to connect this node-based socket to client side javascript. You can do this as we have in `functions.js:1` or within the `<script>` tag in your html file: 

```
socket = io.connect();
```

Now we can create a function to we can use in javascript that will call this node process (`functions.js:2-4`): 

```
save_trial_to_database = function(trial_data){
	socket.emit('insert', trial_data)
}
```

The function `save_trial_to_database()` sends `trial_data` to the server. node is listening for the `insert` tag and has a pre-defined protocol for inserting that data into the database. 

We can call this function whenever we'd like; we've chosen to do this at the end of each trial. In jsPsych this can be implimented by modifying the `on_finish` callback function (`functions.js:57-61`), which is simply:  

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