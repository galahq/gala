# Gala

Gala is the students’ interface for learning from Michigan Sustainability Cases.

## Install

We’re using Vagrant, which lets developers spin up virtual machines with all the
right configuration to develop Gala. Install Vagrant (>= 1.8.7 recommended, so you
can `vagrant plugin install vagrant-fsnotify`), and then

1. `vagrant up`
2. Three tmux panes: `vagrant ssh`
3. then `cd /vagrant`.
4. `npm run webpack:watch` in one
5. `rails s -b0.0.0.0` in vagrant in another
6. `vagrant fsnotify` (not in vagrant)
6. Browse to http://localhost:3000/

