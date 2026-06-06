# syntax = docker/dockerfile:1

ARG RUBY_VERSION=4.0.3
ARG NODE_VERSION=24.15.0

FROM node:${NODE_VERSION}-bookworm-slim AS node

FROM ruby:${RUBY_VERSION}-slim-bookworm AS base

ARG NODE_VERSION=24.15.0
WORKDIR /gala

ENV BUNDLE_PATH="/usr/local/bundle" \
    NODE_ENV="production" \
    NODE_PATH="/usr/local/lib/node_modules" \
    NODE_VERSION="${NODE_VERSION}" \
    PATH="/gala/bin:/usr/local/bundle/bin:/usr/local/bin:${PATH}" \
    RAILS_LOG_TO_STDOUT="true" \
    RAILS_SERVE_STATIC_FILES="true"

# Use the official Node image as a builder source instead of NVM downloads.
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/bin/npm /usr/local/bin/npm
COPY --from=node /usr/local/bin/npx /usr/local/bin/npx
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

# Runtime packages shared by local development and production containers.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    fontconfig \
    git \
    gnupg \
    libjemalloc2 \
    libvips \
    procps \
    wkhtmltopdf \
    xfonts-75dpi \
    xfonts-base \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-17 \
    && ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && ln -sf ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
    && pg_restore --version \
    && node --version \
    && npm --version \
    && corepack enable \
    && corepack prepare pnpm@11.1.0 --activate \
    && pnpm --version \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives /root/.npm

FROM base AS build

# Build dependencies kept out of the production target.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libffi-dev \
    libjemalloc-dev \
    libpq-dev \
    libreadline-dev \
    libssl-dev \
    libyaml-dev \
    make \
    pkg-config \
    python3 \
    zlib1g-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

COPY .ruby-version Gemfile Gemfile.lock package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN echo "gem: --no-document" > /etc/gemrc \
    && gem install bundler:4.0.13 \
    && bundle install --jobs 20 --retry 2 \
    && pnpm install --frozen-lockfile \
    && rm -rf ~/.bundle/ $BUNDLE_PATH/ruby/*/cache $BUNDLE_PATH/ruby/*/bundler/gems/*/.git \
    && gem cleanup all \
    && bundle exec bootsnap precompile --gemfile

COPY . ./

ARG rails_env=production
ENV RAILS_ENV=${rails_env}

RUN if [ "$RAILS_ENV" != "development" ]; then \
    export DATABASE_URL=postgresql://placeholder/placeholder; \
    bundle exec bootsnap precompile app/; \
    SECRET_KEY_BASE=build-placeholder bundle exec rails assets:precompile; \
    fi

RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000
CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0", "-p", "3000"]

FROM build AS development
ENV RAILS_ENV=development \
    NODE_ENV=development \
    HTTP_PORT=3000 \
    HTTPS_PORT="" \
    TARGET_PORT=3001

FROM base AS production
ENV RAILS_ENV=production \
    NODE_ENV=production \
    HTTP_PORT=3000 \
    HTTPS_PORT="" \
    TARGET_PORT=3001

COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /gala /gala

RUN chmod +x entrypoint.sh \
    && groupadd --system --gid 1000 rails \
    && useradd --uid 1000 --gid 1000 --create-home --shell /bin/bash rails \
    && chown -R rails:rails /gala /usr/local/bundle

USER rails
ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000
CMD ["bundle", "exec", "thrust", "bin/rails", "server", "-b", "0.0.0.0", "-p", "3001"]
