# `integration example`

In order to integrate the server side functionality we've developed into your own experiments, there are several lines of code that need to be added to your current scripts. All of these details are below using a [demo experiment](https://www.jspsych.org/tutorials/rt-task/) implimented in **`jsPsych`**. 

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

Now we're ready to integrate our server-side tools with a simple experiment. First, we'll make sure that each experiment imports node's `socket.io`. You can do this by directing the client to the directory where node (e.g. app.js) is running, using the header in your HTML file. Most commonly this is in index.html; in the demo it's line 9 of index.html, which is essentially: 

```
<head>
  <script type="text/javascript" src="./socket.io/socket.io.js"></script>
</head>
```

Because app.js is running in the same folder as index.html, use direct the client to the current working directory with `./socket.io/socket.io.js`, but could also move up the directory using `../socket.io/socket.io.js`, etc. 

Next, we use connect to the node socket with our client side javascript. Most commonly this would be done in functions.js, but can also be done in index.html, as we demonstrate in the demo (`index.html:13`), which is essentially: 

```
<script>
  socket = io.connect();
  save_trial_to_database = function(trial_data){
    socket.emit('insert', trial_data)
  }
</script>
```

Node has a socket open listening for `insert`. The function `save_trial_to_database()` can be called whenever you'd like, and we've chosen to do this at the end of each trial. In jsPsych this can be implimented by modifying the `on_finish` callback function (`index.html:73`), which is essentially:  

```
on_finish: function(data){
  save_trial_to_database(data)
}
```

