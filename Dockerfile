FROM ruby:2.7.6

RUN apt-get update && apt-get install -y \
  build-essential curl gnupg2

# Add PostgreSQL APT repository
RUN curl -sSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
  && echo "deb http://apt.postgresql.org/pub/repos/apt bullseye-pgdg main" > /etc/apt/sources.list.d/pgdg.list

RUN apt-get update && apt-get install -y \
  build-essential curl postgresql-client-16 python

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
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 20 --retry 5

COPY package.json yarn.lock ./
RUN yarn install

COPY . ./

RUN rails tmp:clear log:clear

ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000

CMD ["rails", "s", "-p", "0.0.0.0"]