
Set up your [mongo database](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04#part-two-securing-mongodb), and secure it [here](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04)

A note on the code DigitalOcean provides: from the mongo console, they suggest:

```	
> db.createUser(
...		{
...			user:'ANY_NAME',
...			pwd:'ANY_PASSWORD'
... 		roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
...	}
...)
```

This didn't work for me, but this did: 

```
> db.createUser(
...		{
...			user:'NICE_NAME',
...			pwd:'NICE_PASSWORD'
... 		roles: [ { role: "root", db: "admin" } ]
...	}
...)
```

You can always just try their method and the switch if it doesn't work: 

```
> db.updateUser('NICE_NAME', {roles:  [ { role: "root", db: "admin" } ]})

```