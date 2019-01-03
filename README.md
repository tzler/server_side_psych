# Welcome! 

This repo is designed for anyone interested in using server-side tools to run behavioral experiments online. We walk through the basics of server seteup, domain name registration and routing, as well as enabling standard security protocols, and provide template server-side functions in `node.js` that should be easy to integrate into any javascript based experiments. 

In our experience, using these server-side tools has been essential in order to: 

- Have more control over data collection--avoiding third parties entirely 
- Enable more sophisticated in-experiment data processing and client-client interactions 
- Ensure workers are fairly compensated for their time

# Our (pedagogial and technical) approach

This tutorial centers on a single use case; saving trial-by-trial data onto database, which is housed on the server running our experiment. We chose this starting point for two reasons:

1. This is a useful ability for most experimentalists; it circumvents the need for third parties, getting around some of the restrictive data limitations imposed by crowdsourcing tools (e.g. file size), and gives us more control over the format of the data. 
2. It also serves as a basic starting point for building all of the infracture and know-how we may need for more sophisticated server-side processes down the line; DNS routing, client-server interactions, server-side programming, and web security. 

Starting from a `javascript` implimentation of a browser-based experiment, we use 

- `node.js`: our "backend", manages client-server interactions 
- `Apache HTTP Server`: manages web-server interface
- `Digital Ocean "droplet"`: cloud computing resource 
- `mongodb`: database for data storage and retrieval

These are among the most popular, scalable, open source tools available for this task. They all have great documentation and will certainly proves useful if you hope to work in this space in the future. 


### `Instructions/` 

There are step by step guides on each of the following: 

- **`server_setup.md`**: setting up a Digital Ocean [Droplet](https://www.digitalocean.com/docs/droplets/), configuring `node.js` and `mongodb`
- **`domain_setup.md`**: setting up and routing a domain name to your server
- **`security_setup.md`**: enabeling standard security protocols 
- **`experiment_setup.md`**: server-side functions in interface with `javascript` based experiments

### Code 


- **`experiment/`**: all relevant `node` and `javascript` scripts for running an experiment on your server


The steps above require purchasing a [Digital Ocean Droplet](https://www.digitalocean.com/products/linux-distribution/ubuntu/), which requires a monthly fee (starting at $5.00 a month). If you are a member of an academic institution, it may also be possible to use server resources available to students. (If you know of free server resources, please let us know!) All of the other tools and scripts should be open-source and feely available. 
