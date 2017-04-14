# Gala

Gala is the students’ interface for learning from Michigan Sustainability Cases.

## Install

We’re using Vagrant, which lets developers spin up virtual machines with all the
right configuration to develop Gala. Install Vagrant (>= 1.8.7 recommended, so you
can `vagrant plugin install vagrant-fsnotify`), and then

1. `vagrant up`
2. In one terminal window or tmux pane: `vagrant ssh -c 'cd /vagrant && foreman start'`.
6. In another, `vagrant fsnotify`
6. Browse to http://localhost:3000/

## https://localhost

When developing the LTI tool provider components of Gala, it is useful to be able to use https with the development server. This is how to set that up.

1. Do this in the vagrant instance. Generate a self-signed certificate: `openssl req -new -newkey rsa:2048 -sha1 -days 365 -nodes -x509 -keyout localhost.key -out localhost.crt`
2. Trust the certificate in your vagrant instance: `sudo cp localhost.crt /etc/ssl/cert && sudo cp localhost.key /etc/ssl/private && sudo c_rehash`
3. Trust the certificate on your host machine using Keychain Access. Drag `localhost.crt` into the app, then Get Info and choose Always Trust.
4. Start the development servers with `LOCALHOST_SSL=true foreman start`
6. Browse to https://localhost:3000 (http will not work)
