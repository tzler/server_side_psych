### An extensible use case: experimental access to a server side database

Finally (!) we turn our attention to our web-based experimental ecosystem. We're going to build out a scripts that's able to read and write client-side data to our server-side database during an experiment. The _read_: we query the database to determine whether someone has previously participated in this experiment. The _write_: for folks who haven't already participanted, they proceed as usual, and we save trial-by-trial data to the sever throughout the experiment. If someone has already participanted, we redirect them to another web page that kindly explains why they can't participate in the study. 

These operations should be useful for the most common experiments, and provide a foundation for extending these tools out into more interesting use cases. 

### Getting started :egg::hatching_chick::hatched_chick:

In `server_setup/` we walk through how to set up a server, with the necessary security protocols and Domain Name dependencies; for those who are new to these tools, we have done our best to remove _any ambiguity_ over each decision point, but please let us know if we've missed something. Once your server is up and running, the scripts in `experiment_setup/` illustrate how you might integrate these server-side tools into any javascript-based experiments you already have: 

- `hello_world/` walks through each line of code you need to understand to the basics of client-server interactions using a minimal test case: reading and writing to a server with a client-side interface. 
- `jsPsych_demo/` illustrates the simplest experimental use case---saving trial-by-trial data onto a sever---using a popular javascript-based experimental programming framework ([jsPsych](https://github.com/jspsych/jsPsych)).
- `mturk_demo` integrates the read-write functionality from `hello_world` within the`jsPsych_demo` framework in redirect mturk participants that have completed your task multiple times.

These examples are designed with both pedigogy and practicality in mind. Hopefully, working this will provide an extensible framework for your own experimental and scientific needs :) 
