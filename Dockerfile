# syntax = docker/dockerfile:1

FROM ruby:2.7.6

ENV BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    NVM_DIR="/usr/local/nvm" \
    NODE_VERSION="12.5.0"

WORKDIR /gala

RUN apt-get update -qq && apt-get install -y --fix-missing \
    build-essential curl postgresql-client python \
    libjemalloc2 libvips sqlite3 git \
    pkg-config libpq-dev \
    && rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY .ruby-version package.json yarn.lock ./

# install node and yarn
RUN mkdir $NVM_DIR \
    && curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default
ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
RUN npm install -g yarn

RUN echo "gem: --no-rdoc --no-ri" > /etc/gemrc \
    && gem update --system 3.3.22 \
    && gem install bundler:2.4.19

COPY Gemfile Gemfile.lock ./
# RUN bundle config set --local without 'development test'
RUN bundle install --jobs 20 --retry 2 \
    && rm -rf ~/.bundle/ $BUNDLE_PATH/ruby/*/cache $BUNDLE_PATH/ruby/*/bundler/gems/*/.git \
    && bundle exec bootsnap precompile --gemfile

RUN yarn install --check-files

COPY . ./

ARG rails_env=development
ENV RAILS_ENV=${rails_env}

ARG version
ENV VERSION=${version}

ENV RAILS_LOG_TO_STDOUT=true \
    RAILS_SERVE_STATIC_FILES=true

RUN if [ "$RAILS_ENV" != "development" ]; then \
    SECRET_KEY_BASE=1 \
    DATABASE_URL=postgresql://does/not/matter \
    bundle exec rails assets:precompile; \
fi

RUN bundle exec bootsnap precompile app/

ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000

CMD ["bundle", "exec", "rails", "s", "-p", "0.0.0.0"]