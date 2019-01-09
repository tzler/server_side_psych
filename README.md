# Welcome! 
### This is an experiment-oriented introduction to server side infrastructure

We designed this repo for anyone interested in using server-side tools to run human behavioral experiments online. We provide template functions that should be easy to integrate into any javascript-based experiments you already have, and walk through the prerequisites for integrating these tools with an online crowdsouring platform, like **`Amazon Mechanical Turk (mturk)`**.

#### Outline of experimental infrastructure: 

- **`javascript`**: browser-based experimental implimentation
- **`node.js`**: experimental "backend," manages client-server interactions 
- **`mongodb`**: NoSQL database for data storage
- **`Apache HTTP Server`**: manages web-server interface
- **`Digital Ocean "droplet"`**: cloud computing resource 

These are among the most popular, scalable, open source tools available. They have great documentation, are supported by thriving communities, and will certainly prove useful if you continue this work.

### We focus on a single, scalable use case: server-side data collection

Afer going through this introduction, you'll be able to direct an mturk to a port on your Digital Ocean droplet, where your experiment is being hosted, and, as participants complete the task, their trial-by-trial data will be saved to a server-side database. 

We chose this approach for two reasons:

1. **It's useful**: you'll be able toget around restrictive data limitations often imposed by crowdsourcing tools (e.g. limited file size), and format the data in a way that's well suited for it's end use--all in a secure, easy to access location suitable for long-term storage.
2. **It's extensible**: all of the infrastructure and know-how you may need for more sophisticated client-server processes build on this simple use case (DNS, web security, CRUD operations, etc.)  

### Getting started :egg: :hatching_chick: :hatched_chick: 
There are step by step guides to setting up a fully functional experimental server in **`instructions/`**. All the relevant node and javascript code you'll you'll need are in **`experiment/`**; an example experiment that works as soon as you follow the instructions, and a detailed guied on how to adapt your own experiments to incorporate the same functions. 

We'll go through each step you need to get started, but not the background you'll need to understand everything. For that, we'll try to provide helpful links and leave the rest up to you **:)**
