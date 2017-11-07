# Gala

Gala is a platform for the collaborative study of media-rich teaching cases.

## Install

We’re using Vagrant, which lets developers spin up virtual machines with all the
right configuration to develop Gala. Install Vagrant (>= 1.8.7 recommended, so
you can `vagrant plugin install vagrant-fsnotify`), and then

1. `vagrant up`
1. In one terminal window or tmux pane: `vagrant ssh -c 'cd /vagrant && foreman start'`.
1. In another, `vagrant fsnotify`
1. Browse to http://localhost:3000/
1. Click “Sign in with Google” to access the developer editor account

## https://localhost

When developing the LTI tool provider components of Gala, it is useful to be able to use https with the development server. This is how to set that up.

1. Do this in the vagrant instance. Generate a self-signed certificate: `openssl req -new -newkey rsa:2048 -sha1 -days 365 -nodes -x509 -keyout localhost.key -out localhost.crt`
1. Trust the certificate in your vagrant instance: `sudo cp localhost.crt /etc/ssl/cert && sudo cp localhost.key /etc/ssl/private && sudo c_rehash`
1. Trust the certificate on your host machine using Keychain Access. Drag `localhost.crt` into the app, then Get Info and choose Always Trust.
1. Start the development servers with `LOCALHOST_SSL=true foreman start`
1. Browse to https://localhost:3000 (http will not work)

## Cron jobs

The full-text case search is powered by a Postgres materialized view so it’s
really fast. The consequence is that changes don’t appear in search results
until the view is refreshed. Set a cron job or use Heroku Scheduler or the
equivalent to run `rake indices:refresh` as frequently as makes sense.

To send a weekly report of usage data, run `rake emails:send_weekly_report` once
per week.
