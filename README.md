# Welcome! 

### This is an experiment-oriented introduction to server side infrastructure and programming

This repo is designed for anyone interested in using server-side tools to run human behavioral experiments online. More specifically, With the resources developed in this intro, you'll be set up to host an experiment on your server, route online participants to that location (e.g. via **`Amazon Mechanical Turk (mturk)`**), and utilize server side resources for experimental operations.

#### Outline of experimental infrastructure: 

- **`javascript`**: browser-based experimental implimentation
- **`node.js`**: experimental "backend," manages client-server interactions 
- **`mongodb`**: NoSQL database for data storage
- **`Apache HTTP Server`**: manages web-server interface
- **`Digital Ocean "droplet"`**: cloud computing resource 

These are among the most popular, scalable, open source tools available. They have great documentation, are supported by thriving communities, and will certainly prove useful if you continue this work.

### A relevant use case: experimental access to a server side database

We demonstrate the utility of server side tools by focusing on a particularly relevant use case: reading and writing to a server side database during your experiment. 

- **`Database queries`**: We query the database and determine whether that participant (implimented using mturk's `workerId`) has participated in this study
- **`Database insertions`**: After each trial, that trial's data is saved to the database. 

These two operations should be useful for the things you already are doing, and provide a solid foundation for extending out into more sophisticated use cases. 

### :egg::hatching_chick::hatched_chick: Getting started 

In `server_setup` we walk through how to set up your server, security, and routing, all in order to integrate these tools with an online crowdsouring platform. In `experimental_setup` we provide working examples and template functions that demonstrate how to integrate these tools into any javascript-based experiments you already have.

Once you've completing everything in `server_setup`, the scripts in `experiment_setup/hello_world/` should work out of the box. After you familiarize yourselve with how these server side tools operate, `experiment_setup/integration_demo` illustrates how these tools can be integrated into the experiments you already use. 

We'll go through each step you need to get started, but not the background you'll need to <em>actually</em> understand everything. For that, we'll try to provide helpful links and leave the rest up to you **:)**



