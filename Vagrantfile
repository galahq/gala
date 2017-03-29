# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/xenial64"
  config.vm.provider 'virtualbox' do |v|
    v.memory = 4096
  end

  config.vm.network 'private_network', type: "dhcp" # needed for the nfs synced_folder
  # needed because the default synced_folder method is way too slow
  config.vm.synced_folder ".", "/vagrant", type: "nfs", fsnotify: true
  config.vm.network "forwarded_port", guest: 6000, host: 6000

  config.vm.provision "shell", inline: <<-SHELL
    set -xe

    echo 'America/Detroit' > /etc/timezone
    dpkg-reconfigure -f noninteractive tzdata

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
      qt5-default libqt5webkit5-dev \
      git-core curl zlib1g-dev build-essential libssl-dev libreadline-dev \
      libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev \
      libcurl4-openssl-dev python-software-properties libffi-dev \
      yarn

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

    su postgres -c "createuser ubuntu --superuser" || echo "postgres user 'ubuntu' already exists"
    su postgres -c "psql <<PSQL
ALTER USER ubuntu WITH PASSWORD 'ubuntu'
PSQL
    "
    su ubuntu -c 'echo "*:*:*:ubuntu:ubuntu" > ~/.pgpass && chmod 0600 ~/.pgpass'

    su ubuntu -c "bundle install"
    su ubuntu -c "bundle exec rake db:create"
    su ubuntu -c "bundle exec rake db:create RAILS_ENV=test"

    su ubuntu -c "yarn"

    su ubuntu -c "wget -O- https://toolbelt.heroku.com/install-ubuntu.sh | sh"

    echo "alias heroku-pull='DISABLE_DATABASE_ENVIRONMENT_CHECK=1 bundle exec rake db:drop && heroku pg:pull DATABASE_URL postgresql:///orchard_development --app msc-gala'" >> /home/ubuntu/.bashrc
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

  SHELL

end
