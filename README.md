# Welcome! 

This repo is designed for anyone interested in using server-side tools to run human behavioral experiments online. We provide template functions in `node.js` that should be easy to integrate into any javascript based experiments, and walk through the prerequisites for integrating these tools with an online crowdsouring platforms; setting up a server, domain name registration and routing, standard security protocols, et cetera.  

These tools might be helpful if you're interested in:  

- Having more control over data collection by avoiding third party constraints 
- Enabling within-experiment data processing that's too intensive for a browser
- Enabling multi-agent (e.g. client-client) interactions 
- Ensure workers are fairly compensated for their time by enabling better reduncancies

### This is an experiment-oriented introduction to client-server programming

This tutorial centers on a single use case; directing an online crowdsourcing tool to our server, where an experiment is running, then saving data into a server-side database as it comes in, trial by trial. We chose this starting point for two main reasons:

1. It's useful for most experimentalists: we're able to circumvent the need for third parties, getting around the restrictive data limitations often imposed by crowdsourcing tools (e.g. limited file size), and format the data in a way that's well suited for it's end use. 
2. It's a good foundation: all of the infrastructure and know-how we may need for more sophisticated client-server processes build from this simple use case, which requires knowledge about DNS routing, web security, client-server interactions, and server-side programming. 

A general outline of the tools we use in this tutorial: 

- **`javascript`**: browser-based implimentation of our experiment
- **`node.js`**: our "backend", manages client-server interactions 
- **`Apache HTTP Server`**: manages web-server interface
- **`Digital Ocean "droplet"`**: cloud computing resource 
- **`mongodb`**: database for data storage
- **`jupyter notebooks`**: a friendly python-based interface for data retreival 

These are among the most popular, scalable, open source tools available for this task. They all have great documentation, are supported by thriving communities, and will certainly proves useful if you're hoping to continue this work--trust us **:)** 

### Instructions for each step along the way

In `instructions/` there are step by step guides to everything you need to get things up and running: 

- **`server_setup.md`**: setting up a Digital Ocean [Droplet](https://www.digitalocean.com/docs/droplets/), configuring `node.js` and `mongodb`
- **`domain_setup.md`**: setting up a domain name and routing it to your server
- **`security_setup.md`**: enabeling standard security protocols (firewalls, SSL certificates for https)
- **`experiment_setup.md`**: server-side functions in interface with `javascript` based experiments

### Example code that should get up up and running

In `experiment/` ther are all the relevant `node` and `javascript` scripts you need to run an experiment on your server, as well as a simple experiment that we've already setup for you as an example. 

### Total cost (`time & money`)

The steps above require purchasing a [Digital Ocean Droplet](https://www.digitalocean.com/products/linux-distribution/ubuntu/), which requires a monthly fee (starting at **`$5.00 a month`**). If you are a member of an academic institution, it may also be possible to use server resources available to students. (If you know of free server resources, please let us know!) All of the other tools and scripts should be open-source and feely available. 

We expect this process to take less than **`3 working hours`**, but up to three days given wait times for domain registration and processing.  
