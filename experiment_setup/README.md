# `Experimental code`

The folders in this directory contain example scripts that utilize the server side infrastructure built out in `instructions`:

- `hello_world/` contains the simplest possible implementation of the tools we've developed: reading and writing to a mongo database, using a client side interface. 
- `experiment/` contains an example experiment that demonstrates how the tools we've developed can be adapted for any experiments you are already running online.

You'll need to have a folder called `credentials` in directory that has three json files you've created throughout the set up process: 

- `mongo_keys`: contains the user and password you set to secure mongodb 
- `ssl_certificate`: the ssl certificate you generated to enable https 
- `ssl_privatekey`: the ssl private key you generated to enable https 

You'll also need to make sure you have `port 8888` enabled in your firewall. 



