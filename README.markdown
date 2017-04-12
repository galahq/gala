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
