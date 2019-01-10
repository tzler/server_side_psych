# Overview

1. Initialize a Digital Ocean "Droplet" (a cloud computing resource)
2. Setup a non-root sudo user (a user with administrative privileges) 
3. Install primary dependencies
	- **`node`** 	
	- **`mongodb`**

Throughout this process we'll take several initial security measures

- Setting up a firewall
- Enabling user authentification on mongo 

### 1. Initialize a Digital Ocean "Droplet

First, set up your "droplet" following these [instructions](https://www.digitalocean.com/docs/droplets/how-to/create/). To follow along with this tutorial: 
	
- Distribution: Ubuntu 18.20  (most important) 
- Size: $5 Month (1 GB / 1 CPU, 25 GB SSD disk, 1000 GB transfer) 
- No backups
- Storage center: San Francisco 
- No additional options or SSH keys
	
It takes a minute to initialize and then you'll get an email which has two pieces of information you'll need: 

```
Droplet Name: your_droplet_name
IP Address: SERVER.IP.ADDRESS 
Username: root
Password: yOuRPasSWoRD 
```

With this information, you want go to the command line you want to enter 

```ssh root@SERVER.IP.ADDRESS```

Say `yes` and paste `yOuRPasSWoRD` after copying it from the email, then follow the instructions  to create a new password. 

### 2. Setting up a non-root sudo user

Once you're on the server follow these [steps](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04) to set up a non-root sudo user. You don't need to complete Step 5 for this tutorial, but it's helpful if you're using this server often. Log in in as your non-root sudo user. 

### 3.1 Installing `node` 

The first thing we want to do is set up `node`, which is going to be handling all of our server-side programming needs. We want to install a recent version of `node` by following the steps [here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04). Use `10.x` just like the instructions do and feel free to delete `nodesource_setup.sh` after you've set everything up.

Node isn't a programming language; it's a runtime environment for executing javascript code. Definitely look up some tutorials online to get more familiar with node, but we'll take care of everything you need for this first project. We'll also be using [npm](https://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/). 

### 3.2 Installing `mongodb`

We'll be using [these instructions](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04) to set up the database, and then [secure it](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04#part-three-configuring-remote-access-(optional)). But there is one critial difference you need to incorporate. 

In order to secure the database with a password, the prescribed method [often doesn't work](https://stackoverflow.com/questions/23943651/mongodb-admin-user-not-authorized):  

```
> db.createUser(
...		{
...			user:'<username>',
...			pwd:'<password>'
... 		roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
...	}
...)
```

Instead, follow the format below, setting the user's `role` to `root` instead of `userAdminAnyDatabase`: 

```
> db.createUser(
...		{
...			user:'<username>',
...			pwd:'<password>'
... 		roles: [ { role: "root", db: "admin" } ]
...	}
...)
```

Once you're done, create a simple text file in `credentials/` called ` mongo_admin` that has the following information and json format: 

```
{
	"user": "<username>",
	"pwd": "<password>"
}
```

# Experiment dry run

At this point, the main server-side dependencies we need are in place. The remaining steps are primarily around server security and routing our domain name to the server. Still, we can demonstrate the basic functionality in just a few steps. 

Navigate to the folder with our example experiment and run the following commands to initialize our node-dependent packages: 

	$ npm install minimist express request socket.io underscore

Now let's temporarilly disable the firewall

	$ sudo ufw disable
 
Now let's open a port using node, which will connect our experiment with the world outside: 

	node app.js --port 8881

In this case, we're running our experiment on port **`8881`**. Now direct your web browser to this location: 

	http://SERVER.IP.ADDRESS:8881/index.html

You should see the following page, and be able to run through the experiment. 

	[image of example experiment] 

### **`TO DO :`**
- need a better way to give permissions to user for cert and key