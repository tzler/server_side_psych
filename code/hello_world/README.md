# A 'Hello World!' example in node `:)`

This is a bare bones example that utilizes all of the server side infrastructure we've been developing. It's a good place to start if you need to troubleshoot your setup or try to understand what's going on under the hood

You'll need to create a folder in this directory called `credentials` that has three json files you've created throughout the set up process: 

- ***`mongo_keys`***: contains the user and password you set to secure mongodb 
- ***`ssl_certificate`***: the ssl certificate you generated to enable https 
- ***`ssl_privatekey`***: the ssl private key you generated to enable https 

You'll also need to make sure you have `port 8888` enabled in your firewall. 

Once you have these requirements met, initialize the `node` modules in this folder with `npm`:

```  
npm init --yes # initialize and accept all defaults
```

Install the modules we'll need: 

```
npm install express mongodb
```

This will create a folder `node_modules` in this directory as well as a `package-lock.json` file. Check them out when you have time. 

Run the file we've given a standard node name: 

```
node app.js
```

You should see the following line printed on the console: `Example app listening on port 8888`

Enter the following in your browser:

```
http://<your_domain_name>:<port_number>
```

where `<your_domain_name>` is the full domain name you purchased (with the extension, e.g. cutename.com) and `<port_number>` is `8888`. 

You should see `Hello World!` printed out in your browser `:D` 
