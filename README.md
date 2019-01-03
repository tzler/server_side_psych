# Welcome! 
### This is an experiment-oriented introduction to client-server programming

We designed this repo for anyone interested in using server-side tools to run human behavioral experiments online. We provide template functions that should be easy to integrate into any javascript-based experiments you already have, and walk through the prerequisites for integrating these tools with an online crowdsouring platform. 

#### Outline of tools used in this introduction: 

- **`javascript`**: browser-based implimentation of an experiment
- **`node.js`**: "backend" or the experiment, manages client-server interactions 
- **`mongodb`**: NoSQL database for data storage
- **`jupyter notebooks`**: python-based interface for data retreival 
- **`Apache HTTP Server`**: manages web-server interface
- **`Digital Ocean "droplet"`**: cloud computing resource 
- **`Amazon Mechanical Turk (mturk)`**: online crowdsourcing platform

These are among the most popular, scalable, open source tools available for this task. They all have great documentation (minus mturk :unamused: sorry), are supported by thriving communities, and will certainly prove useful if you continue this work.

### We focus on a single, scalable use case: server-side data collection

Afer going through this introduction, you'll be able to direct an online crowdsourcing tool to your server, where an experiment is running, then save data into a server-side database, trial by trial. 

We chose this starting point for two reasons:

1. **It's useful**: you'll be able to circumvent the need for third parties, getting around the restrictive data limitations often imposed by crowdsourcing tools (e.g. limited file size), and format the data in a way that's well suited for it's end use, in a secure, easy to access location. 
2. **It's a great foundation**: all of the infrastructure and know-how you may need for more sophisticated client-server processes build from this simple use case, which requires knowledge about DNS routing, web security, client-server interactions, and server-side programming. 

### Instructions and example code

In **`instructions/`** there are step by step guides to everything you need to get things up and running. In **`experiment/`** ther are all the relevant node and javascript scripts you need to run an experiment on your server, as well as a simple experiment that we've already setup for you as an example. 

### Startup cost (in time & money)

The steps above require purchasing a [Digital Ocean Droplet](https://www.digitalocean.com/products/linux-distribution/ubuntu/), which requires a monthly fee (starting at **`$5.00 a month`**). If you are a member of an academic institution, it may also be possible to use server resources available to students, but these often come with lots of permission issues, and much less documentation. All of the other tools and scripts should be open-source and feely available. 

We expect this process to take less than **`3 working hours`**, but up to three days given wait times for domain registration and processing.  

#### These tools might be especially helpful if you're interested in:  

- Having more control over data collection (avoiding third party constraints) 
- Enabling within-experiment data processing that's too intensive for a browser
- Enabling multi-agent (e.g. client-client) interactions 
- Ensuring that workers are fairly compensated for their time (better redundancies)

If you have suggestions, corrections, or would like us to make other resources availabe here, send us an email. 
