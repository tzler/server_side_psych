# Welcome! 

This repo is designed for people interested in better utilizing server-side programming tools to run behavioral experiments online. This material will be especially well suited for people familiar with client-side programming (e.g. you already are comfortable creating javascript-based experiments) but want to gentle introduction to server-side programming (e.g. server seteup, node.js, DNS Registrars, ets.). While there are lots of reasons this might be helpful, in our experience it's essential in order to: 

- Have more control over data collection--avoiding third parties entirely 
- Enable more sophisticated client-server and client-client interactions 
- Better redundancies to ensure workers are fairly compensated for their time


### Infrastructure/instructions overview 

In this folder the key instruction scripts are: 

- **`server_setup.md`**: instructions for setting up a Digital Ocean [Droplet](https://www.digitalocean.com/docs/droplets/) and configuring `node.js` to manage server-side processes
- **`mongo_setup.md`**: instructions for setting up `mongoDB` as our server-side [databse](https://www.mongodb.com/what-is-mongodb) and enabling the necessary protections
- **`experiment_setup.md`**: contains directions for adapting a preconfigured `javascript` based experiment for your own needs
- **`domain_setup.md`**: instructions to make the tools above compatible with a popular crowdsourcing tool, `Amazon's Mechanical Turk`, or "mturk" 
- **`experiment/`**: contains all relevant `node` and `javascript` scripts for running an experiment on your server

The steps above require purchasing a [Digital Ocean Droplet](https://www.digitalocean.com/products/linux-distribution/ubuntu/), which requires a monthly fee (starting at $5.00 a month). If you are a member of an academic institution, it may also be possible to use server resources available to students. (If you know of free server resources, please let us know!) All of the other tools and scripts should be open-source and feely available. 