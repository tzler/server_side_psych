### credentials 

Info about each file you'll need to include in this folder
- `aws_keys.json`: needed to submit "HITs" on mturk; set up in `experiment_setup/mturk_demo/README.md` 
- `mongo_keys`: needed to read/write to database; set up in `server_setup/security_setup.md` 
- `my_worker_id`: needed to troubleshoot experiments; set up in `experiment_setup/mturk_demo/README.md`
- `ssl_certificate`: needed to establish secure client-server connection; set up in `server_setup/security_setup.md`  
- `ssl_privatekey`: needed to establish secure client-server connection; set up in `server_setup/security_setup.md`

### dealing with expired ssl certificates

The ssl certificates expire periodically. The instructions outlined in `server_setup/security_setup.md` make sure that these certificates are updated as soon as they expire, in their home locations---in `/etc/letsencrypt/live/<your_domain_name>/fullchain.pem` and `/etc/letsencrypt/live/<your_domain_name>/privkey.pem`. However, `app.js` will only read the files in the `credentials/`. There are [numerous ways](https://stackoverflow.com/questions/48078083/lets-encrypt-ssl-couldnt-start-by-error-eacces-permission-denied-open-et/54903098#54903098) to address these expirations. Our approach here is simple: copy over the updated ssl certificates whenever they expire (your browser will tell you whenever they do!).   

You can do that with a single command by first generating a file `update_credentials.sh` in this `credentials/` folder, and filling in the following code:  

```
#!/bin/bash
sudo cat /etc/letsencrypt/live/<your_domain_name>/fullchain.pem > ssl_certificate
sudo cat /etc/letsencrypt/live/<your_domain_name>/privkey.pem > ssl_privatekey
```

where `<your_domain_name>` is the domain name of your server that you set up in `server_setup/`. Once you've completed this, you can simply run the following line of code from the command line (when you're within the `credentials/` folder): 

```
$ bash update_credentials.sh
```

This will overwrite your old (expired) ssl credentials with the new ones. 
