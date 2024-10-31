FROM ruby:2.7.7

RUN apt-get update && apt-get install -y \
  build-essential curl postgresql-client python

# install bundler
RUN gem update --system 3.3.22
RUN gem install bundler -v 2.4.22

# install node and yarn
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

RUN mkdir -p /rails
WORKDIR /rails

RUN echo "gem: --no-rdoc --no-ri" > /etc/gemrc
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 20 --retry 5

COPY package.json yarn.lock ./
RUN yarn install

COPY . ./

RUN rails tmp:clear log:clear

ENTRYPOINT ["./bin/docker-entrypoint"]
EXPOSE 3000

CMD ["rails", "s", "-p", "0.0.0.0"]