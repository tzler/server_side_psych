# `Domain name setup and routing`

The main purpose of this section is to ensure that your server is compatibile with online crowdsourcing tools. Our lab uses **`Amazon Mechanical Turk`** ("mturk"), and in order to make this server-side infrastructure compatibile with mturk we have to enable [https](https://https.cio.gov/faq/) encryption between our servers and third parties. To enable https, first, we need to set up a domain name, then go through the appropriate steps to secure it. 

### A general outline of the steps at this stage: 

1. Purchase a domain name 
2. Route the domain name to your server's IP address with DNS
3. Manage your domain name's DNS records with Digital Ocean
4. Install and configuring `Apache` to manage web traffic to the server 


## 1. Get a domain name

A domain name is just a human readable pointer to some location on the internet. For example, `google.com` is a more legible version of it's Internet Protocol (IP) address, `172.217.6.206`, but a web browser understands them both just fine. Your droplet already has an IP address. So you just need to find a domain name and then route visitors from that domain name to your server, like google does. 

We've used [namecheap](https://www.namecheap.install and configure Apache to manage web traffic onto the server. com/), but you can use whatever providor you like--[freenom](https://www.freenom.com/en/index.html) is free, but we haven't tested it. 

## 2. Route your domain name to your IP addresses

DNS (**`Domain Name System`**) is a naming system that maps a server's domain name, like `google.com`, to an IP address, like `172.217.6.206`. **`Registrars`** are organizations that have completed some accreditation process that allows them to sell domain names (e.g. Namecheap). Once you've purchased a domain name, you can manage your DNS records with other providers (e.g. digital ocean). 

In order to manage your DNS records with digital ocean, first you need to tell your registrar that Digital Ocean is actually going to be managing things. To do this, you need to direct [your Registrar to Digital Ocean's Nameservers](https://www.digitalocean.com/community/tutorials/how-to-point-to-digitalocean-nameservers-from-common-domain-registrars):

- ns1.digitalocean.com
- ns2.digitalocean.com
- ns3.digitalocean.com

This routing process can take up to 24 hours.

## 3. Manage your DNS records on Digital Ocean

Now you'll need to take care of these DNS records through Digital Ocean. 

### 3.1 Add your domain name to your droplet

Use the instructions [here](https://www.digitalocean.com/docs/networking/dns/how-to/add-domains/) to have Digital Ocean accept incoming traffic from your domain name. 

### 3.2 Set up two `A Records`

Now you'll need to [set up two A records](https://www.digitalocean.com/docs/networking/dns/how-to/manage-records/) using DigitalOcean's DNS for 

- `yourdomainname.com`
- `www.yourdomainname.com`  

It make take a minute for everything to register. 

### 3.2 Verify routing was successfull 

Before moving on, check to make sure this worked. Previously you had to type in something like this before (and this still works): 
	
```
$ ssh root@104.248.212.50
```
	
now you'll be able to do it like this: 
	
```
$ ssh root@yourdomainname.com
```

using the same user name and password. Alternatively, you need to use `root@www.yourdomainname.com`.

## 4. Install and configure **`Apache`**

Now we'll need to install and configure Apache to manage web traffic onto the server. 

### 4.1 Install Apache

Let's begin by updating the local package index to reflect the latest upstream changes:

```
$ sudo apt update
```

Then, install the apache2 package:

```
$ sudo apt install apache2
```

After confirming the installation, apt will install Apache and all required dependencies.

### 4.2 Checking your web server

At the end of the installation process, Ubuntu 18.04 starts Apache. The web server should already be up and running.

Check with the systemd init system to make sure the service is running by typing:

```
$ sudo systemctl status apache2
```

which should output

```
Output
● apache2.service - The Apache HTTP Server
   Loaded: loaded (/lib/systemd/system/apache2.service; enabled; vendor preset: enabled)
  Drop-In: /lib/systemd/system/apache2.service.d
           └─apache2-systemd.conf
   Active: active (running) since Tue 2018-04-24 20:14:39 UTC; 9min ago
 Main PID: 2583 (apache2)
    Tasks: 55 (limit: 1153)
   CGroup: /system.slice/apache2.service
           ├─2583 /usr/sbin/apache2 -k start
           ├─2585 /usr/sbin/apache2 -k start
           └─2586 /usr/sbin/apache2 -k start
```

As you can see from this output, the service appears to have started successfully. However, the best way to test this is to request a page from Apache.

You can access the default Apache landing page to confirm that the software is running properly through your IP address. If you do not know your server's IP address, you can get it a few different ways from the command line.

Try typing this at your server's command prompt:

```
hostname -I
```

You will get back a few addresses separated by spaces. You can try each in your web browser to see if they work.

An alternative is typing this, which should give you your public IP address as seen from another location on the internet:

```
curl -4 icanhazip.com
```

When you have your server's IP address, enter it into your browser's address bar:

```
http://YOUR.IP.ADDRESS
```

You should see the default Ubuntu 18.04 Apache web page:

<div>
<img style='width:80%' src='https://assets.digitalocean.com/articles/lamp_1404/default_apache.png'>
</div>

This page indicates that Apache is working correctly. It also includes some basic information about important Apache files and directory locations.

### 4.3 Setting Up Virtual Hosts

```
$ sudo mkdir -p /var/www/yourdomainname.com/html
```
Make sure that <your_domain_name> includes the `.com`, e.g. `sudo mkdir -p /var/www/mycutename.com/html`

```
$ sudo chown -R $USER:$USER /var/www/yourdomainname.com/html
```

and then make sure with

```
$ sudo chmod -R 755 /var/www/yourdomainname.com
```

Next, create a sample index.html page using vi or your favorite editor:

```
$ vi /var/www/yourdomainname.com/html/index.html
```

```
<html>
    <head>
        <title>Welcome!</title>
    </head>
    <body>
        <h1>yourdomainname.com is working!</h1>
    </body>
</html>

```

save and close this file.


```
$ sudo vi /etc/apache2/sites-available/yourdomainname.com.conf
```

Paste and edit the following into this file:

```
<VirtualHost *:80>
    ServerAdmin admin@yourdomainname.com
    ServerName yourdomainname.com
    ServerAlias www.yourdomainname.com
    DocumentRoot /var/www/yourdomainname.com/html
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

```

Notice that we've updated the DocumentRoot to our new directory and ServerAdmin to an email that the example.com site administrator can access. We've also added two directives: ServerName, which establishes the base domain that should match for this virtual host definition, and ServerAlias, which defines further names that should match as if they were the base name.


Save and close the file when you are finished.

Let's enable the file with the a2ensite tool:


```
$ sudo a2ensite yourdomainname.com.conf
```

Disable the default site defined in 000-default.conf:

```
$ sudo a2dissite 000-default.conf
```

Next, let's test for configuration errors:

```
$ sudo apache2ctl configtest
```
You should see the following output:

```
Output
Syntax OK
```

Restart Apache to implement your changes:

```
$ sudo systemctl restart apache2
```

Apache should now be serving your domain name. You can test this by navigating to http://yourdomainname.com



### 4.4 Important Apache Files and Directories

Now that you know how to manage the Apache service itself, you should take a few minutes to familiarize yourself with a few important directories and files.

#### Content
- `/var/www/html`: The actual web content, which by default only consists of the default Apache page you saw earlier, is served out of the /var/www/html directory. This can be changed by altering Apache configuration files.
Server Configuration
- `/etc/apache2`: The Apache configuration directory. All of the Apache configuration files reside here.
- `/etc/apache2/apache2.conf`: The main Apache configuration file. This can be modified to make changes to the Apache global configuration. This file is responsible for loading many of the other files in the configuration directory.
- `/etc/apache2/ports.conf`: This file specifies the ports that Apache will listen on. By default, Apache listens on port 80 and additionally listens on port 443 when a module providing SSL capabilities is enabled.
- `/etc/apache2/sites-available/`: The directory where per-site virtual hosts can be stored. Apache will not use the configuration files found in this directory unless they are linked to the sites-enabled directory. Typically, all server block configuration is done in this directory, and then enabled by linking to the other directory with the a2ensite command.
- `/etc/apache2/sites-enabled/`: The directory where enabled per-site virtual hosts are stored. Typically, these are created by linking to configuration files found in the sites-available directory with the a2ensite. Apache reads the configuration files and links found in this directory when it starts or reloads to compile a complete configuration.
- `/etc/apache2/conf-available/`, /etc/apache2/conf-enabled/: These directories have the same relationship as the sites-available and sites-enabled directories, but are used to store configuration fragments that do not belong in a virtual host. Files in the conf-available directory can be enabled with the a2enconf command and disabled with the a2disconf command.
- `/etc/apache2/mods-available/`, `/etc/apache2/mods-enabled/`: These directories contain the available and enabled modules, respectively. Files in ending in .load contain fragments to load specific modules, while files ending in .conf contain the configuration for those modules. Modules can be enabled and disabled using the a2enmod and a2dismod command.

#### Server Logs

- `/var/log/apache2/access.log`: By default, every request to your web server is recorded in this log file unless Apache is configured to do otherwise.
- `/var/log/apache2/error.log`: By default, all errors are recorded in this file. The LogLevel directive in the Apache configuration specifies how much detail the error logs will contain.


### 4.6 Commands for managing the Apache Process

Now that you have your web server up and running, let's go over some basic management commands.

To stop your web server, type:

```
sudo systemctl stop apache2
```

To start the web server when it is stopped, type:

```
sudo systemctl start apache2
```

To stop and then start the service again, type:

```
sudo systemctl restart apache2
```

If you are simply making configuration changes, Apache can often reload without dropping connections. To do this, use this command:

```
sudo systemctl reload apache2
```

By default, Apache is configured to start automatically when the server boots. If this is not what you want, disable this behavior by typing:

```
sudo systemctl disable apache2
```

To re-enable the service to start up at boot, type:

```
sudo systemctl enable apache2
```

Apache should now start automatically when the server boots again.


Most of this is taken directly from [DigitalOcean's tutorials](https://www.digitalocean.com/community/tutorials/how-to-install-the-apache-web-server-on-ubuntu-18-04#step-5-%E2%80%94-setting-up-virtual-hosts-(recommended)) but I've reorganized things for pedegogical reasons.
