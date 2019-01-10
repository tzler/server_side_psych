# Compatibility with online crowdsourcing tools

Our lab uses **`Amazon Mechanical Turk`** ("mturk") for crowdsourcing our experiments online. In order to make our server-side infrastructure compatibile with mturk, we have to enable [https](https://https.cio.gov/faq/) encryption between our servers and third parties. We'll do this in two steps. First, we need to set up a domain name. Second, we need to set up a [SSL Certificate](https://www.globalsign.com/en/ssl-information-center/what-is-an-ssl-certificate/) for our server. This is all to protect the privacy of people who are participating in our studies. 

What we'll also do is enable our firewall so that traffic on our server only flows through the appropriate channels; we'll enable ports that will be used for routing the domain name to the server, and giving them access to the experiment, as well as connecting the mongo database. 

### A general outline of the steps at this stage: 

1. Purchase a domain name 
2. Route the domain name to your server's IP address with DNS
3. Manage your domain name's DNS records with Digital Ocean
4. Install and configuring `Apache` to manage the domain name traffic
5. Get an SSL certification to enable https 
6. Configure your server's firewall 
7. Configure node to run via https

### 1: Get a domain name

A domain name is just a human readable pointer to some location on the internet. For example, `google.com` is a more legible version of it's Internet Protocol (IP) address, `172.217.6.206`, but a web browser understands them both just fine. Your droplet already has an IP address. So you just need to find a domain name and then route visitors from that domain name to your server, like google does. 

We've used [namecheap](https://www.namecheap.com/), but you can use whatever providor you like--[freenom](https://www.freenom.com/en/index.html) is free, but we haven't tested it. 

### 2: Route your domain names to your IP addresses

DNS (**`Domain Name System`**) is a naming system that maps a server's domain name, like `google.com`, to an IP address, like `172.217.6.206`. **`Registrars`** are organizations that have completed some accreditation process that allows them to sell domain names (e.g. Namecheap). Once you've purchased a domain name, you can manage your DNS records with other providers (e.g. digital ocean). 

In order to manage your DNS records with digital ocean, first you need to tell your registrar that Digital Ocean is actually going to be managing things. To do this, you need to direct [your Registrar to Digital Ocean's Nameservers](https://www.digitalocean.com/community/tutorials/how-to-point-to-digitalocean-nameservers-from-common-domain-registrars):

- ns1.digitalocean.com
- ns2.digitalocean.com
- ns3.digitalocean.com

### 3: Configure your Digital Ocean droplet

[Add your domain name to your droplet](https://www.digitalocean.com/docs/networking/dns/how-to/add-domains/) so that you can manage you DNS records on Digital Ocean. Once you've done this, [set up two A records](https://www.digitalocean.com/docs/networking/dns/how-to/manage-records/) using DigitalOcean DNS. First set the host name with an '@' (which will give you `yourdomainname.com`) in the first box, then paste the IP address of your server in the second box. Second, set the host name in the first box with `www.` (which will give you `www.yourdomainname.com`) and enter the same IP address in the second box. 

Once you've made these updates, it make take a minute for everything to register. Before moving on, check to make sure this worked. You'll be able to ssh into your droplet using the domain name; where you had to type in something like this before (and this still works): 
	
	ssh root@104.248.212.50
	
now you'll be able to do it like this: 
	
	ssh root@yourdomainname.com

Alternatively, it might be that you need to use `root@www.yourdomainname.com`

### 4: Install adn configure **`Apache`**


Set up [apache](https://www.digitalocean.com/community/tutorials/how-to-install-the-apache-web-server-on-ubuntu-18-04)


### 5: Get an SSL certificate

Setting up a SSL certificate is straightforward through the [command line on your droplet](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-ubuntu-18-04), logged in as a non-root sudo user. Be judicious using there, as there's a [per-week limit](https://letsencrypt.org/docs/rate-limits/). 

In step 4, choose 2 so that all of the traffic is automatically routed through https, and when you run the command:

	$ sudo certbot --apache -d example.com -d www.example.com

the following files are (typically) created in the following locations: 

- **`certificate`**: `/etc/letsencrypt/live/<yourdomainname>/fullchain.pem`
-  **`key`**: `/etc/letsencrypt/live/<yourdomainname>/privkey.pem`

Verirify this, make a copy of each of these file and put it in the same `credentials/` folder that your mongo admin key is in. **Make sure that your non-root sudo users has read access to these files**. Give these files the following names in `credentials/`

- **`ssl_certificate`**
- **`ssl_privatekey`**


### 6: Configure your server's firewall 

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
### 7: Configuring node to incorporate these authentification keys

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
