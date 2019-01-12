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

## 2. Setting up a non-root sudo user

### 2.1 log onto your server as `root`

With the information above, you want to log onto your server via the command line: 

```
@ ssh root@SERVER.IP.ADDRESS
```

Say `yes` and paste `yOuRPasSWoRD` after copying it from the email, then follow the instructions  to create a new password. 

The root user is the administrative user in a Linux environment that has very broad privileges. Because of the heightened privileges of the root account, you are discouraged from using it on a regular basis. This is because part of the power inherent with the root account is the ability to make very destructive changes, even by accident.

### 1.2 Creating a New User

Once you are logged in as root, we're prepared to add the new user account that we will use to log in from now on.

Replace `<your_user_name>` with a username that you like:

```
$ adduser <your_user_name>
```

You will be asked a few questions, starting with the account password.

Enter a strong password and, optionally, fill in any of the additional information if you would like. This is not required and you can just hit ENTER in any field you wish to skip.

### 1.3 Granting Administrative Privileges

Now, we have a new user account with regular account privileges. However, we may sometimes need to do administrative tasks.

To avoid having to log out of our normal user and log back in as the root account, we can set up what is known as "superuser" or root privileges for our normal account. This will allow our normal user to run commands with administrative privileges by putting the word sudo before each command.

To add these privileges to our new user, we need to add the new user to the sudo group. By default, on Ubuntu 18.04, users who belong to the sudo group are allowed to use the sudo command.

As root, run this command to add your new user to the sudo group (substitute the highlighted word with your new user):

```
$ usermod -aG sudo sammy
```

Now, when logged in as your regular user, you can type sudo before commands to perform actions with superuser privileges.

### 3 Installing `node` 

The first thing we want to do is set up `node`, which is going to be handling all of our server-side programming needs. We want to install a recent version of `node` by following the steps [here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04). Use `10.x` just like the instructions do and feel free to delete `nodesource_setup.sh` after you've set everything up.

Node isn't a programming language; it's a runtime environment for executing javascript code. Definitely look up some tutorials online to get more familiar with node, but we'll take care of everything you need for this first project. We'll also be using [npm](https://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/). 

### 3.2 Installing `mongodb`

We'll be using [these instructions](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04) to set up the database, and then [secure it](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04#part-three-configuring-remote-access-(optional)). 

### Step 1 — Installing MongoDB

Ubuntu's official package repositories include an up-to-date version of MongoDB, which means we can install the necessary packages using apt.

First, update the packages list to have the most recent version of the repository listings:

```
sudo apt update
```

Now install the MongoDB package itself:

```
sudo apt install -y mongodb
```

This command installs several packages containing the latest stable version of MongoDB, along with helpful management tools for the MongoDB server. The database server is automatically started after installation.

Next, let's verify that the server is running and works correctly.

###Step 2 — Checking the Service and Database

The installation process started MongoDB automatically, but let's verify that the service is started and that the database is working.

First, check the service's status:

```
sudo systemctl status mongodb
```

You'll see this output:

```
Output
● mongodb.service - An object/document-oriented database
   Loaded: loaded (/lib/systemd/system/mongodb.service; enabled; vendor preset: enabled)
   Active: active (running) since Sat 2018-05-26 07:48:04 UTC; 2min 17s ago
     Docs: man:mongod(1)
 Main PID: 2312 (mongod)
    Tasks: 23 (limit: 1153)
   CGroup: /system.slice/mongodb.service
           └─2312 /usr/bin/mongod --unixSocketPrefix=/run/mongodb --config /etc/mongodb.conf
According to systemd, the MongoDB server is up and running.
```
We can verify this further by actually connecting to the database server and executing a diagnostic command

Execute this command:

```
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

This will output the current database version, the server address and port, and the output of the status command:

```
Output
MongoDB shell version v3.6.3
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.6.3
{
        "authInfo" : {
                "authenticatedUsers" : [ ],
                "authenticatedUserRoles" : [ ]
        },
        "ok" : 1
}
A value of 1 for the ok field in the response indicates that the server is working properly.
```
Next, we'll look at how to manage the server instance.


###Managing mongo 

Step 3 — Managing the MongoDB Service
MongoDB installs as a systemd service, which means that you can manage it using standard systemd commands alongside all other sytem services in Ubuntu.

To verify the status of the service, type:
```
sudo systemctl status mongodb
```

You can stop the server anytime by typing:

```
sudo systemctl stop mongodb
```
To start the server when it is stopped, type:

```
sudo systemctl start mongodb
```

You can also restart the server with a single command:

```
sudo systemctl restart mongodb
```

By default, MongoDB is configured to start automatically with the server. If you wish to disable the automatic startup, type:

```
sudo systemctl disable mongodb
```

It's just as easy to enable it again. To do this, use:

```
sudo systemctl enable mongodb
```

But there is one critial difference you need to incorporate. 

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
