# syntax = docker/dockerfile:1

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=4.0.3
ARG NODE_VERSION=24.15.0
ARG PNPM_VERSION=11.1.0
ARG BUNDLER_VERSION=2.4.19

FROM node:${NODE_VERSION}-bookworm-slim AS node

# Runtime-only base shared by every stage. No Node, no build toolchain.
# Stays on bookworm: wkhtmltopdf (Case PDF exports via PDFKit) was dropped
# from Debian trixie along with QtWebKit.
FROM ruby:${RUBY_VERSION}-slim-bookworm AS base

WORKDIR /gala

ENV BUNDLE_PATH="/usr/local/bundle" \
    LD_PRELOAD="libjemalloc.so.2" \
    MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true,stats_print:false" \
    PATH="/gala/bin:/usr/local/bundle/bin:/usr/local/bin:${PATH}" \
    RAILS_LOG_TO_STDOUT="true" \
    RAILS_SERVE_STATIC_FILES="true"

# wkhtmltopdf + fontconfig/xfonts back Case PDF exports; libvips backs
# image_processing; libjemalloc2 is preloaded above for lower memory use.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    fontconfig \
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# Throw-away build stage: Node/pnpm tooling, gem compilation, asset precompile.
FROM base AS build

ARG NODE_VERSION
ARG PNPM_VERSION
ARG BUNDLER_VERSION

ENV NODE_ENV="production" \
    NODE_PATH="/usr/local/lib/node_modules" \
    NODE_VERSION="${NODE_VERSION}"

# Use the official Node image as the toolchain source instead of NVM downloads.
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    libffi-dev \
    libpq-dev \
    libssl-dev \
    libyaml-dev \
    pkg-config \
    zlib1g-dev \
    && ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && ln -sf ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
    && node --version \
    && npm --version \
    && corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate \
    && pnpm --version \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives /root/.npm

COPY .ruby-version Gemfile Gemfile.lock package.json pnpm-lock.yaml pnpm-workspace.yaml ./

ARG rails_env=production
ENV RAILS_ENV=${rails_env}

# Keep bundler in lockstep with BUNDLED WITH in Gemfile.lock.
RUN echo "gem: --no-document" > /etc/gemrc \
    && gem install bundler:${BUNDLER_VERSION} \
    && if [ "$RAILS_ENV" != "development" ]; then \
         bundle config set deployment 'true'; \
         bundle config set without 'development test'; \
       fi \
    && bundle config set build.sassc --disable-march-tune-native \
    && bundle install --jobs 20 --retry 2 \
    && pnpm install --frozen-lockfile \
    && rm -rf ~/.bundle/ /root/.local/share/pnpm /root/.npm \
    && rm -rf "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git \
    && gem cleanup all \
    && bundle exec bootsnap precompile --gemfile

COPY . ./

# Precompile assets without real secrets, then prune everything the runtime
# image doesn't need. Development images skip this: they keep node_modules
# for the webpack dev server and specs for the test suite.
RUN if [ "$RAILS_ENV" != "development" ]; then \
      export DATABASE_URL=postgresql://placeholder/placeholder; \
      SECRET_KEY_BASE_DUMMY=1 bundle exec bootsnap precompile app/ lib/; \
      SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile; \
      rm -rf node_modules spec coverage tmp/cache tmp/shakapacker \
             /root/.cache /root/.local/share/pnpm /root/.npm ~/.bundle \
             "${BUNDLE_PATH}"/ruby/*/cache; \
    fi \
    && chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000
CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0", "-p", "3000"]

FROM build AS development
ENV RAILS_ENV=development \
    NODE_ENV=development

# Final stage for the production app image: runtime base + built artifacts.
FROM base AS production
ENV RAILS_ENV=production \
    NODE_ENV=production

COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /gala /gala

# Run as a non-root user that owns only the writable runtime directories.
RUN groupadd --system --gid 1000 rails \
    && useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash \
    && mkdir -p log storage tmp/pids tmp/cache \
    && chown -R rails:rails log storage tmp

USER rails
ENTRYPOINT ["./entrypoint.sh"]
EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
