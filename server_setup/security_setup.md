# `Security Setup`


Now that you have a domain name that is routed to your server, we need to set up an [SSL Certificate](https://www.globalsign.com/en/ssl-information-center/what-is-an-ssl-certificate/) in order to enable https. This is all to protect the privacy of people who are participating in our studies. We'll also take several steps in this sections to protect our database. 


### Security-related steps: 
1. Get an SSL certification to enable https between your server and third parties
2. Secure mongo database with a user specified password
3. Configure your server's firewall, enabling experimental ports
4. Establish permissions for node to run via https on prespecified ports

## 1. `SSL certification`

Setting up a SSL certificate is straightforward from the command line on your droplet, logged in as a non-root sudo user. Be judicious using there, as there's a [per-week limit](https://letsencrypt.org/docs/rate-limits/) using this free resource. 

#### Verify that you have: 

- An A record with `example.com` pointing to your server's public IP address.
- An A record with `www.example.com` pointing to your server's public IP address.
- Apache installed by following How To Install Apache on Ubuntu 18.04. Be sure that you have a virtual host file for your domain. This tutorial will use /etc/apache2/sites-available/example.com.conf as an example.

### 1.1 Installing Certbot

The first step to using Let's Encrypt to obtain an SSL certificate is to install the Certbot software on your server.

First, add the repository:

```
$ sudo add-apt-repository ppa:certbot/certbot
```

You'll need to press ENTER to accept. Now install Certbot's Apache package with apt:

```
$ sudo apt install python-certbot-apache
```

Certbot is now ready to use, but in order for it to configure SSL for Apache, we need to verify some of Apache's configurations.

### 1.2 Set Up the SSL Certificate

Certbot needs to be able to find the correct virtual host in your Apache configuration for it to automatically configure SSL. Specifically, it does this by looking for a ServerName directive that matches the domain you request a certificate for.

You should have a VirtualHost block for your domain at `/etc/apache2/sites-available/<your_domain_name>.com.conf` with the ServerName directive already set appropriately.To check, open the virtual host file for your domain using nano or your favorite text editor:

```
$ sudo nano /etc/apache2/sites-available/example.com.conf
```

Find the existing ServerName line. It should look like this:

```
...
ServerName example.com;
...
```

If it does, exit your editor and move on to the next step.

If it doesn't, update it to match. Then save the file, quit your editor, and verify the syntax of your configuration edits:

```
$ sudo apache2ctl configtest
```

If you get an error, reopen the virtual host file and check for any typos or missing characters. Once your configuration file's syntax is correct, reload Apache to load the new configuration:

```
$ sudo systemctl reload apache2
```

Certbot can now find the correct VirtualHost block and update it.

### 1.3 Obtaining an SSL Certificate

Certbot provides a variety of ways to obtain SSL certificates through plugins. The Apache plugin will take care of reconfiguring Apache and reloading the config whenever necessary. To use this plugin, type the following:

```
$ sudo certbot --apache -d example.com -d www.example.com
```

This runs certbot with the --apache plugin, using -d to specify the names you'd like the certificate to be valid for.

If this is your first time running certbot, you will be prompted to enter an email address and agree to the terms of service. After doing so, certbot will communicate with the Let's Encrypt server, then run a challenge to verify that you control the domain you're requesting a certificate for.

If that's successful, certbot will ask how you'd like to configure your HTTPS settings:

```
Output

Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
-------------------------------------------------------------------------------
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
new sites, or if you're confident your site works on HTTPS. You can undo this
change by editing your web server's configuration.
-------------------------------------------------------------------------------

```

Select `2` and the press ENTER. The configuration will be updated, and Apache will reload to pick up the new settings. certbot will wrap up with a message telling you the process was successful and where your certificates are stored:

```
Output
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/example.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/example.com/privkey.pem
   Your cert will expire on 2018-07-23. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot again
   with the "certonly" option. To non-interactively renew *all* of
   your certificates, run "certbot renew"
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le

```

Your certificates are downloaded, installed, and loaded. Try reloading your website using https:// and notice your browser's security indicator. It should indicate that the site is properly secured, usually with a green lock icon. If you test your server using the SSL Labs Server Test, it will get an A grade.

### 1.4 Verifying Certbot Auto-Renewal

Let's Encrypt's certificates are only valid for ninety days. This is to encourage users to automate their certificate renewal process. The certbot package we installed takes care of this for us by adding a renew script to /etc/cron.d. This script runs twice a day and will automatically renew any certificate that's within thirty days of expiration.

To test the renewal process, you can do a dry run with certbot:

```
$ sudo certbot renew --dry-run
```

If you see no errors, you're all set. When necessary, Certbot will renew your certificates and reload Apache to pick up the changes. If the automated renewal process ever fails, Let’s Encrypt will send a message to the email you specified, warning you when your certificate is about to expire.

### 1.5 prepare your SSL certificate and private key for node

In order to use node across your https encrypted server, you're going to use the certificate and private key you've just generated. The following code assumes that repo is in your home directory (`~`). 

First, make a new folder called `credentials` in the `experiment_setup` folder of this repository. 

```
$ mkdir ~/server_side_psych/experiment_setup/credentials
```

Now generate a new file called `ssl_certificate` in `credentials/` using the SSL certificate you just generated with certbot: 

```
$ sudo cat /etc/letsencrypt/live/<your_domain_name>/fullchain.pem > credentials/ssl_certificate
```
Now generate a new file called `ssl_privatekey` in `credentials/` using the SSL private key you just generated with certbot: 

```
$ sudo cat /etc/letsencrypt/live/<your_domain_name>/privkey.pem > credentials/ssl_privatekey
```

There area lots of other ways you can do this; regardless of how, *make sure that your non-root sudo users has read access to these files*. 

## 2. `Securing Mongodb`

To secure our database we'll create an administrative user, enable authentication, and test to make sure we have access to a secure database.

### 2.1 Adding an Administrative User

To add our user, we'll connect to the Mongo shell via the command line:

```
$ mongo
```

The output when we use the Mongo shell warns us that access control is not enabled for the database and that read/write access to data and configuration is unrestricted.

```
Output
MongoDB shell version v3.4.2
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.2
Welcome to the MongoDB shell.
For interactive help, type "help".
For more comprehensive documentation, see
        http://docs.mongodb.org/
Questions? Try the support group
        http://groups.google.com/group/mongodb-user
Server has startup warnings:
2017-02-21T19:10:42.446+0000 I STORAGE  [initandlisten]
2017-02-21T19:10:42.446+0000 I STORAGE  [initandlisten] ** WARNING: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine
2017-02-21T19:10:42.446+0000 I STORAGE  [initandlisten] **          See http://dochub.mongodb.org/core/prodnotes-filesystem
2017-02-21T19:10:42.534+0000 I CONTROL  [initandlisten]
2017-02-21T19:10:42.534+0000 I CONTROL  [initandlisten] ** WARNING: Access control is not enabled for the database.
2017-02-21T19:10:42.534+0000 I CONTROL  [initandlisten] **          Read and write access to data and configuration is unrestricted.
2017-02-21T19:10:42.534+0000 I CONTROL  [initandlisten]
>
```

We're free to choose the name for the administrative user since the privilege level comes from the assignment of the role `root` (but see exception below). The database, admin designates where the credentials are stored. You can learn more about authentication in the MongoDB Security Authentication section.

Set the username of your choice and be sure to pick your own secure password and substitute them in the command below:

```
> use admin
> db.createUser(
... {
...    user: "your_admin_name",
...    pwd: "your_admin_password",
...    roles: [ { role: "root", db: "admin" } ]
...  }
...)
```

**`POSSIBLE EXCEPTION`**: On some systems you might need to use a different role in order to have admin accuess. If you encounter anthentification errors with the mongo database you might just need to replace the roles above with: 

- `roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]`

When we issue the db.createUser command, the shell will prepend three dots before each line until the command is complete. After that, we should receive feedback like the following when the user has been added.

```
Successfully added user: {
        "user" : "your_admin_name",
        "roles" : [
                {
                        "role" : "root",
                        "db" : "admin"
                }
        ]
}
```

Type 'exit' and press ENTER or use CTRL+C to leave the client.

Once you're done, create a simple text file in `credentials/` called ` mongo_admin` that has the following information and json format: 

```
{
	"user": "<username>",
	"pwd": "<password>"
}
```

At this point, our user will be allowed to enter credentials, but they will not be required to do so until we enable authentication and restart the MongoDB daemon.

### 2.2 Enabling Authentication

Authentication is enabled in the mongod.conf file. Once we enable it and restart mongod, users still will be able to connect to Mongo without authenticating, but they will be required to provide a username and password before they can interact.

Let's open the configuration file with vi (or whatever text editor you'd prefer):

```
$ sudo vi /etc/mongod.conf
```

In the `#security` section, we'll remove the hash in front of security to enable the stanza. Then we'll add the authorization setting. When we're done, the lines should look like the excerpt below:

```
 . . .
security:
  authorization: "enabled"
 . . . 
```

Note that the “security” line has no spaces at the beginning, and the “authorization” line must be indented with two spaces

Once we've saved and exited the file, we'll restart the daemon:

```
sudo systemctl restart mongod
```

If we've made an error in the configuration, the dameon won't start. Since systemctl doesn't provide output, we'll use its status option to be sure that it did:.

```
sudo systemctl status mongod
```

If we see Active: active (running) in the output and it ends with something like the text below, we can be sure the restart command was successful:

```
Output
Jan 23 19:15:42 MongoHost systemd[1]: Started High-performance, schema-free document-oriented database.
```

Having verified the daemon is up, let's test authentication.

### 2.3 Verifying that unauthenticated Users are Restricted

First, let's connect without credentials to verify that our actions are restricted:

```
$ mongo 
```

Now that we've enabled authentication, all of the earlier warnings are resolved.

```
Output
MongoDB shell version v3.4.2
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.2
```

We're connected to the test database. We'll test that our access is restricted with the `show dbs` command:

```
> show dbs
Output
2017-02-21T19:20:42.919+0000 E QUERY    [thread1] Error: listDatabases failed:{
        "ok" : 0,
        "errmsg" : "not authorized on admin to execute command { listDatabases: 1.0 }",
        "code" : 13,
        "codeName" : "Unauthorized"
 . . . 
```

We wouldn't be able to create users or similarily privileged tasks without authenticating.

Let's exit the shell to proceed:

```
> exit
```

Next, we'll make sure our Administrative user does have access.

### 2.4 Verifying the administrative user's access

We'll connect as our administrator with the -u option to supply a username and -p to be prompted for a password. We will also need to supply the database where we stored the user's authentication credentials with the --authenticationDatabase option.

``
mongo -u <your_user_name> -p --authenticationDatabase admin
``

We'll be prompted for the password, so supply it. Once we enter the correct password, we'll be dropped into the shell, where we can issue the show dbs command:

```
Output
MongoDB shell version v3.4.2
Enter password:
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.2
>
```

Rather than being denied access, we should see the available databases:

```
> show dbs
Output
admin  0.000GB
local  0.000GB
```

## 3. `Configure server's firewall`

Now let's take measurse to protect our server: configuring a firewall. To do this we'll need to initialize a firewall, and enable the ports we'll be using for our experiments--as well as our `ssh` access to the server. 

### 3.1 setting up https and mongo access

First, let's check on the status of our firewall

```
$ sudo ufw status
```

[ should be disabled ] 

Now let's see what port profiles are available:

```
$ sudo ufw app list
```

There are other ways of establishing the same firewall functionality, but these profiles are in a nice, human readable format. First let's enable ssh so we can continue logging onto the server (otherwise we'd be locked out!): 

```
$ ufw allow OpenSSH
```
And let's enable `Apache Full`, which supports https:

```
$ sudo ufw allow 'Apache Full'
```

We can get a list of the ports the firewall gives us access too with

```
$ sudo ufw status
```

If `OpenSSH` and `Apache Full` have been enabled, the output should look like this: 

```
Output
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere                  
Apache Full                ALLOW       Anywhere                  
OpenSSH (v6)               ALLOW       Anywhere (v6)             
Apache Full (v6)           ALLOW       Anywhere (v6)  
```

### 3.2 Setting up access to experimental ports

When we run experiments, we're going to direct people to specific ports on our server, so we need to give people access to these specific ports across the firewall. For a single port, (e.g. `8888`) we could enable acccess to this port by running `sudo ufw allow 8888`. But we want to allow a range of ports, because we might be running multiple experiments at the same time. 

To open ports 8880-8889 

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

## 4. `Configure authentification keys in node`

*All of these steps have been implimented in `experiment_setup/hello_world/app.js`. This is just a guide through that logic.* 

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
