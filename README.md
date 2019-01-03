# Welcome! 
### This is an experiment-oriented introduction to server side programming

We designed this repo for anyone interested in using server-side tools to run human behavioral experiments online. We provide template functions that should be easy to integrate into any javascript-based experiments you already have, and walk through the prerequisites for integrating these tools with an online crowdsouring platform, like **`Amazon Mechanical Turk (mturk)`**.

#### Outline of tools used in this introduction: 

- **`javascript`**: browser-based implimentation of an experiment
- **`node.js`**: experimental "backend," manages client-server interactions 
- **`mongodb`**: NoSQL database for data storage
- **`Apache HTTP Server`**: manages web-server interface
- **`Digital Ocean "droplet"`**: cloud computing resource 
- **`jupyter notebooks`**: python-based interface for data retreival 

These are among the most popular, scalable, open source tools available for this task. They have great documentation, are supported by thriving communities, and will certainly prove useful if you continue this work.

### We focus on a single, scalable use case: server-side data collection

Afer going through this introduction, you'll be able to direct an online crowdsourcing tool to your server, where an experiment is running, then save data into a server-side database, trial by trial. 

We chose this starting point for two reasons:

1. **It's useful**: you'll be able to circumvent the need for third parties, getting around the restrictive data limitations often imposed by crowdsourcing tools (e.g. limited file size), and format the data in a way that's well suited for it's end use, in a secure, easy to access location suitable for long-term storage.
2. **It's a great foundation**: all of the infrastructure and know-how you may need for more sophisticated client-server processes build from this simple use case, which requires knowledge about DNS routing, web security, client-server interactions, and server-side programming. 

### Getting started :heart_eyes:

In **`instructions/`** there are step by step guides to everything you need to get things up and running. In **`experiment/`** ther are all the relevant node and javascript scripts you need to run an experiment on your server, as well as a simple experiment that we've already setup for you as an example. 