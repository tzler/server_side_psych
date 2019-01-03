# Initial `Digital Ocean` server setup

[ -- website info -- ] 

First, set up your "droplet". For this tutorial we're using 
	
	- Distribution: Ubuntu 18.20  
	- Size: $5 Month (1 GB / 1 CPU, 25 GB SSD disk, 1000 GB transfer) 
	- No backups
	- Storage center: San Francisco 
	- No additional options or SSH keys
	
It takes a minute to initialize and then you'll get an email which has two pieces of information you'll need: 

```
Droplet Name: your_droplet_name
IP Address: YOUR.IP.ADDRESS  # 68.183.167.134
Username: root
Password: yOuRPasSWoRD 
```

With this information, you want go to the command line you want to enter 

```ssh root@YOUR.IP.ADDRESS```

Say `yes` and paste `yOuRPasSWoRD` after copying it from the email, then follow the instructions  to create a new password. Once you're on the server follow these [steps](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04) to set up a non-root sudo user. 

Log in in as your non-root sudo user. 

# Installing `node` 

The first thing we want to do is set up `node`, which is going to be handling all of our server-side programming needs. We want to install a recent version of `node` by following the steps [here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04). 

Use `10.x` just like the instructions do and feel free to delete `nodesource_setup.sh` after you've set everything up. Remember that instead of using `node` to execute node commends, as is often seen in online tutorials, on Digital Oceans Ubuntu 18.04 droplets we have to type `nodejs`. 

Node isn't a programming language; it's a runtime environment for executing javascript code. We'll provide you with all the node-based coding you need to get your experiment up and running on your server, but definitely look up some introductory tutorials online. We'll also be using [npm](https://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/), with the same level of involvement as node. 

	npm install minimist express request socket.io underscore


And now make sure that we dont have a firewall enabled

	sudo ufw disable
 
Now let's 

	simple server example: not experiment, just a browser accessable example


# Installing `mongodb`

https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04



# Experiment dry run

	node app.js --port 8881

Now modify this and enter it into your browser: 

	http://YOUR.IP.ADDRESS:8881/index.html

#### Great! Now the main server-side dependencies we need are in place. 