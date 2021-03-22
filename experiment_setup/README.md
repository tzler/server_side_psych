### An extensible use case: experimental access to a server side database

We're ready for experiments! The folders in this directory build up a code base that should be useful for the most common experiments, and provide a foundation for extending these tools out into more interesting use cases. We use Amazon Mechanical Turk (i.e. 'mturk') as a platform that connects us with people who volunteer to participate online, so there is some mturk-specific code in this directory. But the server-side operations here are agnostic to the platform, and can be adopted quite easily once you work through the examples. 

There are several basic operations we use 

- _reading_ from a browser: we collect platform-dependent identifiers about each experimental participant from their browser
- _reading_ from a database: we determine if someone has already participated in this study, using the data from their browser 
- _writing_ to the database: for new participants, we save trial-by-trial data to the server
- _redirecting_: we send repeat participants to a web page that explains that they cant repeat this experiment

### Getting started :egg::hatching_chick::hatched_chick:

We suggest going through the folders in this directory in the following order 

- `hello_world/` walks through each line of code you need to understand to the basics of client-server interactions using a minimal test case: reading and writing to a server with a client-side interface. 
- `jsPsych_demo/` illustrates the simplest experimental use case---saving trial-by-trial data onto a sever---using a popular javascript-based experimental programming framework ([jsPsych](https://github.com/jspsych/jsPsych)).
- `mturk_demo` integrates the read-write functionality from `hello_world` within the`jsPsych_demo` framework in redirect mturk participants that have completed your task multiple times.

These examples are designed with both pedigogy and practicality in mind. Hopefully, working this will provide an extensible framework for your own experimental and scientific needs :) 
