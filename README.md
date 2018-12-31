### Welcome! 

This repo contains a step by step guide on how to setup and run behavioral experiments online. We start with some of the modern server-side tools some experimentalists might need (e.g. for hosting experiments on your own server, saving trial-by-trial data, enabling more sophisticated client-server interactions, etc.) and then integrate these tools with an online crowdsourcing tool we use in our lab. 

### Infrastructure overview 

1. **Server**: `node.js` runs on a digital ocean [droplet](https://www.digitalocean.com/docs/droplets/) for server-side processes
2. **Database**: `mongoDB` us our server-side [databse](https://www.mongodb.com/what-is-mongodb)
3. **Experiment**: `javascript` based experiments, with `jsPsych` examples

### Compatibility with online crowdsourcing tools

Our lab uses `Amazon Mechanical Turk` (or "mturk") for crowdsourcing our experiments online. In order to make the server- and client-side infrastructure above mturk compatibile, we walk through setting up a Domain Name and routing traffic to that site to your droplet. Additionally, we've provided tools to submit experiments to mturk, bonus workers, and compensate workers who encountered an error during the experiment. There are alternatives to mturk--as well as [other mturk management tools](https://github.com/longouyang/nosub). 