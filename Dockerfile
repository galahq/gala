FROM ruby:2.6.6

# Setup the base OS
# RUN apt-get update -qq
# Remove non-critical error messages: https://github.com/moby/moby/issues/27988
# RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential  \
#    apt-transport-https curl ca-certificates postgresql-client

RUN apt-get update && apt-get install -y \
  build-essential curl postgresql-client


# Install yarn and node from sources
# RUN curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
# RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
# RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
# RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
# RUN apt-get update -qq
# RUN apt-get install -y nodejs yarn
# RUN apt autoremove -y

RUN mkdir /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 12.5.0
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
RUN npm install -g yarn




# Create our app directory
RUN mkdir -p /app
WORKDIR /app

# Install bundler then all gems
RUN echo "gem: --no-rdoc --no-ri" > /etc/gemrc
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 20 --retry 5

# Copy everything else
COPY . ./

# Clear any local package files that might get copied
RUN rm -rf ./node_modules ./coverage/*
RUN yarn install --no-optional
RUN rails tmp:clear log:clear
RUN mkdir -p tmp/pids

# default entrypoint
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000
EXPOSE 3035

# This gets passed to entrypoint.sh upon run
CMD ["rails", "s", "-p", "0.0.0.0"]