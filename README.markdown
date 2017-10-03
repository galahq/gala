# Gala

Gala is the students’ interface for learning from Michigan Sustainability Cases.

## Install

We’re using docker, which lets developers spin up virtual machines with all the
right configuration to develop Gala. Install [docker](https://www.docker.com),
then clone this repo and run `bin/setup`

To update your setup after pulling, run `bin/update`

## https://localhost

When developing the LTI tool provider components of Gala, it is useful to be able to use https with the development server. This is how to set that up.

1. Do this in the vagrant instance. Generate a self-signed certificate: `openssl req -new -newkey rsa:2048 -sha1 -days 365 -nodes -x509 -keyout localhost.key -out localhost.crt`
2. Trust the certificate in your vagrant instance: `sudo cp localhost.crt /etc/ssl/cert && sudo cp localhost.key /etc/ssl/private && sudo c_rehash`
3. Trust the certificate on your host machine using Keychain Access. Drag `localhost.crt` into the app, then Get Info and choose Always Trust.
4. Start the development servers with `LOCALHOST_SSL=true foreman start`
6. Browse to https://localhost:3000 (http will not work)
