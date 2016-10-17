# Gala

Gala is the students’ interface for learning from Michigan Sustainability Cases.

## Install

We’re using Vagrant, which lets developers spin up virtual machines with all the
right configuration to develop Gala. Install Vagrant (`brew cask install
vagrant`, perhaps), and then

1. `vagrant up`
2. `vagrant ssh`
3. then `cd /vagrant`.
4. `npm run webpack:watch` in one tmux pane
5. `rails server` in another
6. Browse to http://localhost:3000/

