# syntax = docker/dockerfile:1

FROM ruby:3.2.6

WORKDIR /gala

# environment variables
ENV BUNDLE_PATH="/usr/local/bundle" \
    NVM_DIR="/usr/local/nvm" \
    NODE_VERSION="12.5.0" \
    RAILS_LOG_TO_STDOUT="true" \
    RAILS_SERVE_STATIC_FILES="true"

# install builder dependencies
RUN apt-get update && apt-get install -y \
    wget gnupg2 build-essential curl python3 wkhtmltopdf \
    libvips git pkg-config libjemalloc-dev lsb-release zlib1g-dev \
    libffi-dev libyaml-dev libreadline-dev libssl-dev postgresql-client libpq-dev gcc make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# copy ruby and node configuration files
COPY .ruby-version Gemfile Gemfile.lock package.json yarn.lock ./

# create NVM directory and install node and js dependencies
RUN mkdir -p $NVM_DIR \
    && curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install "$NODE_VERSION" \
    && nvm alias default "$NODE_VERSION" \
    && nvm use default \
    && npm install -g yarn \
    && yarn install --check-files

# install gems
RUN echo "gem: --no-document" > /etc/gemrc \
    && gem update --system 3.3.22 \
    && gem install bundler:2.4.19 \
    && bundle config build.sassc --disable-march-tune-native \
    && bundle install --jobs 20 --retry 2 \
    && rm -rf ~/.bundle/ $BUNDLE_PATH/ruby/*/cache $BUNDLE_PATH/ruby/*/bundler/gems/*/.git \
    && gem cleanup all \
    && bundle exec bootsnap precompile --gemfile

COPY . ./

ARG rails_env=development
ENV RAILS_ENV=${rails_env}
ARG secret_key_base=placeholder
ENV SECRET_KEY_BASE=${secret_key_base}

ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# precompile the app directory if not in development
RUN if [ "$RAILS_ENV" != "development" ]; then \
    export DATABASE_URL=postgresql://placeholder/placeholder; \
    bundle exec bootsnap precompile app/; \
    bundle exec rails assets:precompile; \
    fi

RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000
CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0", "-p", "3000"]
