# frozen_string_literal: true

# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure(2) do |config|
  config.vm.box = 'ubuntu/xenial64'
  config.vm.provider 'virtualbox' do |v|
    v.memory = 4096
  end

  config.vm.network 'private_network', type: 'dhcp' # needed for the nfs synced_folder
  # needed because the default synced_folder method is way too slow
  config.vm.synced_folder '.', '/vagrant', type: 'nfs', fsnotify: true,
                                           exclude: ['node_modules']
  config.vm.network 'forwarded_port', guest: 3000, host: 3000
  config.vm.network 'forwarded_port', guest: 3001, host: 3001

  config.vm.provision 'shell', inline: <<-SHELL
    set -xe

    if [ -e /.installed ]; then
        echo 'Already installed.'

    else
      echo 'America/Detroit' > /etc/timezone
      dpkg-reconfigure -f noninteractive tzdata

      wget -q -O - "https://dl-ssl.google.com/linux/linux_signing_key.pub" | sudo apt-key add -
      echo 'deb http://dl.google.com/linux/chrome/deb/ stable main' >> /etc/apt/sources.list
      curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
      echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
      sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
      wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
      curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -

      sudo apt-get --no-install-recommends install -y \
        postgresql postgresql-contrib-9.6 libpq-dev \
        nodejs git \
        build-essential libreadline-dev \
        libpq-dev libkrb5-dev \
        libxslt-dev libxml2-dev \
        ruby-dev zlib1g-dev \
        xvfb google-chrome-stable unzip\
        git-core curl zlib1g-dev build-essential libssl-dev libreadline-dev \
        libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev \
        libcurl4-openssl-dev python-software-properties libffi-dev \
        imagemagick \
        yarn

      cd /tmp
      wget "https://chromedriver.storage.googleapis.com/2.28/chromedriver_linux64.zip"
      unzip chromedriver_linux64.zip
      mv chromedriver /usr/local/bin

      RUBY_VERSION=`ruby --version | cut -c6-10`
      if [ "x${RUBY_VERSION}" != "x2.5.0" ]; then
          cd /usr/src
          curl -s -O https://cache.ruby-lang.org/pub/ruby/2.5/ruby-2.5.0.tar.bz2
          tar xjf ruby-2.5.0.tar.bz2
          cd ruby-2.5.0/
          ./configure
          make
          make install
      else
          echo "ruby 2.5.0 already installed"
      fi

      cd /vagrant

      gem install bundler debugger-ruby_core_source

      su postgres -c "createuser ubuntu --superuser" || echo "postgres user 'ubuntu' already exists"
      su postgres -c "psql <<PSQL
  ALTER USER ubuntu WITH PASSWORD 'ubuntu'
  PSQL
      "
      su ubuntu -c 'echo "*:*:*:ubuntu:ubuntu" > ~/.pgpass && chmod 0600 ~/.pgpass'

      su ubuntu -c "bundle install"
      su ubuntu -c "bundle exec rake db:setup"

      su ubuntu -c "yarn"

      su ubuntu -c "wget -O- https://toolbelt.heroku.com/install-ubuntu.sh | sh"

      echo "alias heroku-pull='DISABLE_DATABASE_ENVIRONMENT_CHECK=1 bundle exec rake db:drop && heroku pg:pull DATABASE_URL postgresql:///orchard_development --app msc-gala' && RAILS_ENV=test bundle exec rake db:setup" >> /home/ubuntu/.bashrc
      echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

      touch /.installed
    fi
  SHELL
end
