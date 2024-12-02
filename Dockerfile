FROM ruby:2.7.6

RUN apt-get update && apt-get install -y \
  build-essential curl postgresql-client python \
  libjemalloc2 libvips sqlite3 

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

RUN mkdir -p /app
WORKDIR /app

RUN echo "gem: --no-rdoc --no-ri" > /etc/gemrc
RUN gem update --system 3.3.22
RUN gem install bundler:2.4.19
COPY Gemfile Gemfile.lock ./
# RUN bundle config set --local without 'development test'
RUN bundle install --jobs 20 --retry 5

COPY package.json yarn.lock ./
RUN yarn install --check-files

COPY . ./

ARG RAILS_ENV=production
ENV RAILS_ENV=${RAILS_ENV}

RUN SECRET_KEY_BASE=DQtqBFNPcdmMyE7xmYXwnbDcYn6AQVeL33HQbCTGqhcVXKMDMKUfzCBFT8Kz4PECKSR4BzTWeJcHMRCj5tA5sr5bkBq2bKFvmWGfg2cR5pSBd8VW3FRkUNsxV4NBYmzn \
    DATABASE_URL=postgresql://does/not/matter \
    bundle exec rake assets:precompile

ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000

CMD ["bundle", "exec", "rails", "s", "-p", "0.0.0.0"]