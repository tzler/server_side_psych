# `Domain name setup`

The main purpose of this section is to ensure that your server is compatibile with online crowdsourcing tools. Our lab uses **`Amazon Mechanical Turk`** ("mturk"), and in order to make this server-side infrastructure compatibile with mturk we have to enable [https](https://https.cio.gov/faq/) encryption between our servers and third parties. To enable https, first, we need to set up a domain name, then go through the appropriate steps to secure it. 

### A general outline of the steps at this stage: 

1. Purchase a domain name 
2. Route the domain name to your server's IP address with DNS
3. Manage your domain name's DNS records with Digital Ocean
4. Install and configuring `Apache` to manage the domain name traffic

### 1) Get a domain name

A domain name is just a human readable pointer to some location on the internet. For example, `google.com` is a more legible version of it's Internet Protocol (IP) address, `172.217.6.206`, but a web browser understands them both just fine. Your droplet already has an IP address. So you just need to find a domain name and then route visitors from that domain name to your server, like google does. 

We've used [namecheap](https://www.namecheap.com/), but you can use whatever providor you like--[freenom](https://www.freenom.com/en/index.html) is free, but we haven't tested it. 

### 2) Route your domain names to your IP addresses

DNS (**`Domain Name System`**) is a naming system that maps a server's domain name, like `google.com`, to an IP address, like `172.217.6.206`. **`Registrars`** are organizations that have completed some accreditation process that allows them to sell domain names (e.g. Namecheap). Once you've purchased a domain name, you can manage your DNS records with other providers (e.g. digital ocean). 

In order to manage your DNS records with digital ocean, first you need to tell your registrar that Digital Ocean is actually going to be managing things. To do this, you need to direct [your Registrar to Digital Ocean's Nameservers](https://www.digitalocean.com/community/tutorials/how-to-point-to-digitalocean-nameservers-from-common-domain-registrars):

- ns1.digitalocean.com
- ns2.digitalocean.com
- ns3.digitalocean.com

### 3) Configure your Digital Ocean droplet

[Add your domain name to your droplet](https://www.digitalocean.com/docs/networking/dns/how-to/add-domains/) so that you can manage you DNS records on Digital Ocean. Once you've done this, [set up two A records](https://www.digitalocean.com/docs/networking/dns/how-to/manage-records/) using DigitalOcean DNS. First set the host name with an '@' (which will give you `yourdomainname.com`) in the first box, then paste the IP address of your server in the second box. Second, set the host name in the first box with `www.` (which will give you `www.yourdomainname.com`) and enter the same IP address in the second box. 

Once you've made these updates, it make take a minute for everything to register. Before moving on, check to make sure this worked. You'll be able to ssh into your droplet using the domain name; where you had to type in something like this before (and this still works): 
	
	ssh root@104.248.212.50
	
now you'll be able to do it like this: 
	
	ssh root@yourdomainname.com

Alternatively, it might be that you need to use `root@www.yourdomainname.com`

### 4) Install and configure **`Apache`**

Set up [apache](https://www.digitalocean.com/community/tutorials/how-to-install-the-apache-web-server-on-ubuntu-18-04) and make sure entering your domain name into the browser redirects you to your server. 

```
https://<yourdomainname.com>

```