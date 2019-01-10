### Get an SSL certificate

Setting up a SSL certificate is straightforward through the [command line on your droplet](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-ubuntu-18-04), logged in as a non-root sudo user. Be judicious using there, as there's a [per-week limit](https://letsencrypt.org/docs/rate-limits/). 

In step 4, choose 2 so that all of the traffic is automatically routed through https. The files you'll need to keep track of are (typically) created in the following locations: 

- **`certificate`**: `/etc/letsencrypt/live/<yourdomainname>/fullchain.pem`
-  **`key`**: `/etc/letsencrypt/live/<yourdomainname>/privkey.pem`

Verirify this, make a copy of each of these file and put it in the same `credentials/` folder that your mongo admin key is in. **Make sure that your non-root sudo users has read access to these files**. Give these files the following names in `credentials/`

- **`ssl_certificate`**
- **`ssl_privatekey`**


### Configure your server's firewall 

When we run experiments, we're going to direct people to specific ports (e.g. `https://cutename:8888`) so we need to give people access them across the firewall. For a single port, we could run `sudo ufw allow 8888`. But because we want a range we'll enter: 

```
$ sudo ufw allow 8880:8889/tcp
```

We also need to open up a port so that we have access to the mongo database. We'll use the default mongo port 

```
sudo ufw allow 27017
```

Running the following command 

```
$ sudo ufw status
```

should show us all the ports that we've enabled to access our server: 

```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Apache Full                ALLOW       Anywhere
8880:8889/tcp              ALLOW       Anywhere
27017                      ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
Apache Full (v6)           ALLOW       Anywhere (v6)
8880:8889/tcp (v6)         ALLOW       Anywhere (v6)
27017 (v6)                 ALLOW       Anywhere (v6)
```
### Configure node to incorporate these authentification keys

Now that we've set up all these security protocols, we need to ensure that the node has permission to operate within them; running default http ports here, for example, would just result in an error. That is, node needs to be able to tell the server (firewall, apache, etc.) that it has permission to to operate freely. 

We begin at the top of **`app.js`**, importing the modules we'll need (omitting modules not relevant for security purposes)

```
const express = require('express');
const app = express();
const mongo_client = require('mongodb').MongoClient;
const https = require('https');
const socket_io = require('socket.io');
```

Then we set up ports and secure the necessary authentification keys:

```
// set experiment port to a location we've enabled
const external_port = 8888;

// extract relevant info from SSL key and certification
const options = {
  key:  fs.readFileSync("credentials/ssl_privatekey"),
  cert: fs.readFileSync("credentials/ssl_certificate")
};

// extract mongo authentification keys
const db_key = JSON.parse(fs.readFileSync('credentials/mongo_keys'));
// construct string for mongo connection that has authentification info 
const mongo_url = `mongodb://${db_key.user}:${db_key.pwd}@localhost:27017`;
```

Finally, we use the authentification info above to make connections with the server: 

```
// setup server-side port using credentials
const server = https.createServer(options,app)
const io = socket_io(server)

// use mongo_url to connect to database
	... 
	mongo_client.connect(mongo_url, function(err,client) {
		... 
		// omitting whole function but making clear the use case

```

This should allow us to operate freely, even while our server is more secure. 
