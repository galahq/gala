# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.network "forwarded_port", guest: 3000, host: 3456
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
  end

  config.vm.provision "shell", privileged: false, inline: <<-SHELL
    sudo apt-get -qq update
    sudo apt-get -qq install -y \
      postgresql postgresql-contrib-9.3 nodejs libpq-dev git

    # RVM
    gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
    curl -sL https://get.rvm.io | bash -s stable --ruby=2.3.0
    source /home/vagrant/.rvm/scripts/rvm
    rvm --default use ruby-2.3.0
    ruby -v

    # Install some gems
    rvm gemset use global
    echo "gem: --no-document" >> ~/.gemrc
    gem install bundler nokogiri

    sudo -u postgres createuser vagrant --superuser

    cd /vagrant
    bundle install
    rake db:setup
  SHELL

end

