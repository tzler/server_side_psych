# `Domain name setup and routing`

The main purpose of this section is to ensure that your server is compatibile with online crowdsourcing tools. Our lab uses **`Amazon Mechanical Turk`** ("mturk"), and in order to make this server-side infrastructure compatibile with mturk we have to enable [https](https://https.cio.gov/faq/) encryption between our servers and third parties. To enable https, first, we need to set up a domain name, then go through the appropriate steps to secure it. 

### A general outline of the steps at this stage: 

1. Purchase a domain name 
2. Route the domain name to your server's IP address with DNS
3. Manage your domain name's DNS records with Digital Ocean
4. Install and configuring `Apache` to manage the domain name traffic

## 1. Get a domain name

A domain name is just a human readable pointer to some location on the internet. For example, `google.com` is a more legible version of it's Internet Protocol (IP) address, `172.217.6.206`, but a web browser understands them both just fine. Your droplet already has an IP address. So you just need to find a domain name and then route visitors from that domain name to your server, like google does. 

We've used [namecheap](https://www.namecheap.com/), but you can use whatever providor you like--[freenom](https://www.freenom.com/en/index.html) is free, but we haven't tested it. 

## 2. Route your domain name to your IP addresses

DNS (**`Domain Name System`**) is a naming system that maps a server's domain name, like `google.com`, to an IP address, like `172.217.6.206`. **`Registrars`** are organizations that have completed some accreditation process that allows them to sell domain names (e.g. Namecheap). Once you've purchased a domain name, you can manage your DNS records with other providers (e.g. digital ocean). 

In order to manage your DNS records with digital ocean, first you need to tell your registrar that Digital Ocean is actually going to be managing things. To do this, you need to direct [your Registrar to Digital Ocean's Nameservers](https://www.digitalocean.com/community/tutorials/how-to-point-to-digitalocean-nameservers-from-common-domain-registrars):

- ns1.digitalocean.com
- ns2.digitalocean.com
- ns3.digitalocean.com

This routing process can take up to 24 hours.

## 3) Manage your DNS records on Digital Ocean

Now you'll need to take care of these DNS records through Digital Ocean. 

### 3.1 Add your domain name to your droplet

Use the instructions [here](https://www.digitalocean.com/docs/networking/dns/how-to/add-domains/) to have Digital Ocean accept incoming traffic from your domain name. 

### 3.2 Set up two `A Records`

Now you'll need to [set up two A records](https://www.digitalocean.com/docs/networking/dns/how-to/manage-records/) using DigitalOcean's DNS for 

- `yourdomainname.com`
- `www.yourdomainname.com`.  

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

## 4) Install and configure **`Apache`**

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
http://your_server_ip
```

You should see the default Ubuntu 18.04 Apache web page:

<div>
<img style='width:80%' src='https://assets.digitalocean.com/articles/lamp_1404/default_apache.png'>
</div>

This page indicates that Apache is working correctly. It also includes some basic information about important Apache files and directory locations.

### 4.3 Commands for managing the Apache Process

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
