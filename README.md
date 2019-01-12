## An experiment-oriented introduction to server side infrastructure and programming

#### Motivation

Psychologists and cognitive neuroscientists increasingly rely on web-base crowdsourcing platforms (e.g. Amazon Mechanical Turk) to perform human behavioral experiments. This repository walks through how to set up and integrate server side tools into these browser-based experiments. 

#### Outline of experimental infrastructure: 

- **`javascript`**: browser-based experimental implimentation
- **`node.js`**: experimental "backend," manages client-server interactions 
- **`mongodb`**: NoSQL database for data management
- **`Apache HTTP Server`**: manages web-server interface
- **`Digital Ocean "droplet"`**: cloud computing resource 

<div style='width:60%; text-align: center'>
	<em>some visualization of infrastructure</em>:
	<img src="some_image_.jpg">
</div>

### An extensible use case: experimental access to a server side database

We focus on a single use case: reading and writing to a server side database during an experiment. First, we query the database and determine whether that participant (implimented using mturk's 'workerId') has already participated in this study. Then, we save trial-by-trial data to the sever throughout the experiment. These operations should be useful for the most common experiments, and provide a foundation for extending these tools out into more interesting use cases. 

### Getting started :egg::hatching_chick::hatched_chick:

In `server_setup` we walk through how to set up a server, with the necessary security protocols and Domain Name dependencies. Once your server is up and running, the scripts in `experiment_setup/` illustrate how you might integrate these server-side tools into any javascript-based experiments you already have: `hello_world` is a working introduction to server side programming, while `integration_demo` illustrates how these tools can be integrated into the experiments you already use. 