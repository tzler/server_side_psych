# Welcome! 
### This is an experiment-oriented introduction to server side infrastructure and programming

We designed this repo for anyone interested in using server-side tools to run human behavioral experiments online. With the resources developed in this intro, you'll be set up to host an experiment on your server, route online participants to that location (e.g. via **`Amazon Mechanical Turk (mturk)`**), and utilize server side resources for experimental operations.

#### Outline of experimental infrastructure: 

- **`javascript`**: browser-based experimental implimentation
- **`node.js`**: experimental "backend," manages client-server interactions 
- **`mongodb`**: NoSQL database for data storage
- **`Apache HTTP Server`**: manages web-server interface
- **`Digital Ocean "droplet"`**: cloud computing resource 

These are among the most popular, scalable, open source tools available. They have great documentation, are supported by thriving communities, and will certainly prove useful if you continue this work.

### A two part process: `server setup` and `experimental setup`

In `server_setup` we walk through server setup, security, and routing, all in order to integrate these tools with an online crowdsouring platform. In `experimental_setup` we provide working examples and template functions that demonstrate how to integrate these tools into any javascript-based experiments you already have.

### A relevant use case: experimental access to a server side database

Ee demonstrate the utility of server side tools by focusing on a particularly relevant use case: integrating experimental functions with a server side database. We provide well commented, extensible code that performs two basic functions. **`Experiment initialization`**: At the begining of each experiment, we query the database and redirect a participant if they've previously participated in the study (implimented using mturk's `workerId`). **`Data collection`**: After each trial, that trial's data is saved to the database. 

We chose these operations for two reasons:

1. **It's useful for what most of us already do**: On the front end of the experiment, you can tailor the initialization procedure to your own needs  you'll be able to get around data limitations often imposed by crowdsourcing tools (e.g. file size), and format the data in a way that's prepped for it's end use--all in a secure, easy to access location suited for long-term storage.
2. **It's a solid foundation for more sophisticated uses**: all of the infrastructure and know-how you may need for more sophisticated client-server processes build on this simple use case (DNS, web security, CRUD operations, etc.)  

### :egg::hatching_chick::hatched_chick: Getting started 

We'd recommend starting and completing everything in `server_setup`. At that point, the scripts in `experiment_setup/hello_world/` should work out of the box. Once you understand how these server side tools operate, the example experiment in `experiment_setup/integration_demo` illustrates how these tools can be integrated into the experiments you already use. 

We'll go through each step you need to get started, but not the background you'll need to <em>actually</em> understand everything. For that, we'll try to provide helpful links and leave the rest up to you **:)**
