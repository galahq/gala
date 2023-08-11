FROM ruby:2.6.6

RUN apt-get update && apt-get install -y \
  build-essential curl postgresql-client

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

# Create our app directory
RUN mkdir -p /app
WORKDIR /app

# Install all gems
RUN echo "gem: --no-rdoc --no-ri" > /etc/gemrc
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 20 --retry 5

# Install all node modules
COPY package.json yarn.lock ./
RUN yarn install

# Copy everything else
COPY . ./

# Clear any local package files that might get copied
RUN rails tmp:clear log:clear

# default entrypoint
ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000

# TODO need to precompile assets for production


# This gets passed to entrypoint.sh upon run
CMD ["rails", "s", "-p", "0.0.0.0"]