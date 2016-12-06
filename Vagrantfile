# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provider 'virtualbox' do |v|
    v.memory = 2048
  end

  config.vm.network 'private_network', type: "dhcp" # needed for the nfs synced_folder
  # needed because the default synced_folder method is way too slow
  config.vm.synced_folder ".", "/vagrant", type: "nfs", fsnotify: true
  config.vm.network "forwarded_port", guest: 3000, host: 3000

  config.vm.provision "shell", inline: <<-SHELL
    set -xe

    echo 'America/Detroit' > /etc/timezone
    dpkg-reconfigure -f noninteractive tzdata

    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
    wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
    sudo apt-get update -y

    sudo apt-get --no-install-recommends install -y \
      postgresql postgresql-contrib-9.6 libpq-dev \
      nodejs git \
      build-essential libreadline-dev \
      libpq-dev libkrb5-dev \
      libxslt-dev libxml2-dev \
      ruby-dev \
      phantomjs

    RUBY_VERSION=`ruby --version | cut -c6-10`
    if [ "x${RUBY_VERSION}" != "x2.3.1" ]; then
        cd /usr/src
        curl -s -O https://cache.ruby-lang.org/pub/ruby/2.3/ruby-2.3.1.tar.bz2
        tar xjf ruby-2.3.1.tar.bz2
        cd ruby-2.3.1/
        ./configure
        make
        make install
    else
        echo "ruby 2.3.1 already installed"
    fi

    cd /vagrant

    gem install bundler debugger-ruby_core_source

    su postgres -c "createuser vagrant --superuser" || echo "postgres user 'vagrant' already exists"
    su postgres -c "psql <<PSQL
ALTER USER vagrant WITH PASSWORD 'vagrant'
PSQL
    "
    su vagrant -c 'echo "*:*:*:vagrant:vagrant" > ~/.pgpass && chmod 0600 ~/.pgpass'

    su vagrant -c "bundle install"
    su vagrant -c "bundle exec rake db:create"
    su vagrant -c "bundle exec rake db:create RAILS_ENV=test"

    wget -q http://nodejs.org/dist/v5.1.0/node-v5.1.0-linux-x64.tar.gz
    sudo tar -C /usr/local --strip-components 1 -xzf node-v5.1.0-linux-x64.tar.gz
    cd /vagrant
    npm install

    su vagrant -c "wget -O- https://toolbelt.heroku.com/install-ubuntu.sh | sh"

    echo "alias heroku-pull='DISABLE_DATABASE_ENVIRONMENT_CHECK=1 bundle exec rake db:drop && heroku pg:pull DATABASE_URL postgresql:///orchard_development --app msc-gala'" >> /home/vagrant/.bashrc
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

  SHELL

end
