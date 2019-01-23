# Overview

1. Initialize a Digital Ocean "Droplet" (a cloud computing resource)
2. Setup a non-root sudo user (a user with administrative privileges) 
3. Installing `node.js`, which will manage our server client interactions 
4. Installing `mongodb`, which will be our server side database
5. Testing that our setup was successfull

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

### 2.2 Creating a New User

Once you are logged in as root, we're prepared to add the new user account that we will use to log in from now on.

Replace `<your_user_name>` with a username that you like:

```
$ adduser <your_user_name>
```

You will be asked a few questions, starting with the account password.

Enter a strong password and, optionally, fill in any of the additional information if you would like. This is not required and you can just hit ENTER in any field you wish to skip.

### 2.3 Granting Administrative Privileges

Now, we have a new user account with regular account privileges. However, we may sometimes need to do administrative tasks.

To avoid having to log out of our normal user and log back in as the root account, we can set up what is known as "superuser" or root privileges for our normal account. This will allow our normal user to run commands with administrative privileges by putting the word sudo before each command.

To add these privileges to our new user, we need to add the new user to the sudo group. By default, on Ubuntu 18.04, users who belong to the sudo group are allowed to use the sudo command.

As root, run this command to add your new user to the sudo group (substitute the highlighted word with your new user):

```
$ usermod -aG sudo sammy
```

Now, when logged in as your regular user, you can type sudo before commands to perform actions with superuser privileges.

## 3. Installing `node.js` 

Node isn't a programming language; it's a runtime environment for executing javascript code. From wikipedia: 

> Node.js is an open-source, cross-platform JavaScript run-time environment that executes JavaScript code outside of a browser. JavaScript is used primarily for client-side scripting, in which scripts written in JavaScript are embedded in a webpage's HTML and run client-side by a JavaScript engine in the user's web browser. Node.js lets developers use JavaScript to write command line tools and for server-side scripting—running scripts server-side to produce dynamic web page content before the page is sent to the user's web browser. Consequently, Node.js represents a "JavaScript everywhere" paradigm, unifying web application development around a single programming language, rather than different languages for server side and client side scripts.

Definitely look up some tutorials online to get more familiar with node, but we'll take care of everything you need for this first project. 

### 3.1 downloading primary dependencies for node

```
$ sudo apt update
```

Install Node.js from the repositories:

```
$ sudo apt install nodejs
```

We're also installing ([npm](https://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/)), the Node.js package manager. You can do this by typing:

```
$ sudo apt install npm
```

This will allow you to install modules and packages to use with Node.js.

To check which version of Node.js you have installed after these initial steps, type:

```
nodejs -v
```

### 3.2 getting more recent versions 

To get a more recent version of Node.js you can add the PPA (personal package archive) maintained by NodeSource. This will have more up-to-date versions of Node.js than the official Ubuntu repositories, and will allow you to choose between Node.js v6.x (supported until April of 2019), Node.js v8.x (the current LTS version, supported until December of 2019), Node.js v10.x (the second current LTS version, supported until April of 2021), and Node.js v11.x (the current release, supported until June 2019).

First, install the PPA in order to get access to its contents. From your home directory, use curl to retrieve the installation script for your preferred version, making sure to replace 10.x with your preferred version string (if different):

```
$ cd ~
$ curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
```

Run the script under sudo:

```
$ sudo bash nodesource_setup.sh
```

The PPA will be added to your configuration and your local package cache will be updated automatically. After running the setup script from Nodesource, you can install the Node.js package in the same way you did above:
```
sudo apt install nodejs
```
To check which version of Node.js you have installed after these initial steps, type:

```
nodejs -v

Output
v10.14.0
```

The nodejs package contains the nodejs binary as well as npm, so you don't need to install npm separately.

npm uses a configuration file in your home directory to keep track of updates. It will be created the first time you run npm. Execute this command to verify that npm is installed and to create the configuration file:

```
npm -v
Output
6.4.1
```

## 4. Installing `mongodb`

Ubuntu's official package repositories include an up-to-date version of MongoDB, which means we can install the necessary packages using apt.


### 4.1 Initial install

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

### 4.2 Checking the Service and Database

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
```

A value of 1 for the ok field in the response indicates that the server is working properly.

### 4.3 Managing mongo 

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

## 5. node test

At this point, the main server-side dependencies we need are in place. The remaining steps are primarily around server security and routing our domain name to the server. Let's make sure that our setup so far is in order. 

First, open up a server on port 8888 with the script in this directory by running

```
node test.js
```

Now open your browser and navigate to this page: 

```
http://YOUR.SERVER.IP.ADDRESS:8888/
```

You should get a message in your browser telling you `Great! NodeJS is running on your server :)` and you should also be able to read a server side message telling you that you've successfully sent a message to the client. 
