# syntax = docker/dockerfile:1

ARG RUBY_VERSION=4.0.3
ARG NODE_VERSION=24.15.0
ARG BUNDLER_VERSION=4.0.13
ARG PNPM_VERSION=11.1.0
ARG DEBIAN_SUITE=bookworm

FROM --platform=$TARGETPLATFORM ruby:${RUBY_VERSION}-slim-${DEBIAN_SUITE} AS base
ARG BUNDLER_VERSION

WORKDIR /gala

ENV BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="" \
    PATH="/gala/bin:/usr/local/bundle/bin:/usr/local/bin:${PATH}" \
    RAILS_LOG_TO_STDOUT="true" \
    RAILS_SERVE_STATIC_FILES="true"

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    fontconfig \
    git \
    libjemalloc2 \
    libvips \
    procps \
    wkhtmltopdf \
    xfonts-75dpi \
    xfonts-base \
    postgresql-client \
    && echo "gem: --no-document" > /etc/gemrc \
    && gem install bundler -v ${BUNDLER_VERSION} \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives /root/.bundle

FROM --platform=$TARGETPLATFORM node:${NODE_VERSION}-${DEBIAN_SUITE}-slim AS node
ARG NODE_VERSION
ARG PNPM_VERSION

FROM base AS dependency-builder
ARG NODE_VERSION
ARG PNPM_VERSION
ENV NODE_VERSION="${NODE_VERSION}" \
    NODE_PATH="/usr/local/lib/node_modules"

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/bin/npm /usr/local/bin/npm
COPY --from=node /usr/local/bin/npx /usr/local/bin/npx
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && ln -sf ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
    && corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate \
    && node --version && npm --version && pnpm --version

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
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives /root/.npm

COPY .ruby-version Gemfile Gemfile.lock package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM dependency-builder AS development
ENV NODE_ENV="development" \
    RAILS_ENV="development" \
    HTTP_PORT=3000 \
    HTTPS_PORT="" \
    TARGET_PORT=3001

RUN bundle install --jobs 20 --retry 2 \
    && pnpm install --frozen-lockfile

COPY . ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["bundle", "exec", "thrust", "bin/rails", "server", "-b", "0.0.0.0", "-p", "3001"]

FROM dependency-builder AS production-builder
ENV NODE_ENV="production" \
    RAILS_ENV="production"

RUN bundle config set deployment 'true' \
    && bundle config set without 'development test'

RUN bundle install --jobs 20 --retry 2 \
    && pnpm install --frozen-lockfile --prod

COPY . ./

RUN export DATABASE_URL=postgresql://placeholder/placeholder \
    && SECRET_KEY_BASE_DUMMY=1 SECRET_KEY_BASE=build-placeholder bundle exec rails assets:precompile \
    && chmod +x entrypoint.sh \
    && rm -rf tmp/webpack spec test coverage .git node_modules \
    && rm -rf ~/.cache /root/.cache /root/.local/share/pnpm /root/.npm \
    && rm -rf ${BUNDLE_PATH}/ruby/*/cache ${BUNDLE_PATH}/ruby/*/bundler/gems/*/.git

FROM base AS production
ENV NODE_ENV="production" \
    RAILS_ENV="production" \
    HTTP_PORT=3000 \
    HTTPS_PORT="" \
    TARGET_PORT=3001

COPY --from=production-builder /usr/local/bundle /usr/local/bundle
COPY --from=production-builder /gala /gala

RUN mkdir -p /gala/tmp/pids /gala/tmp/cache /gala/log \
    && groupadd --system --gid 1000 rails \
    && useradd --uid 1000 --gid 1000 --create-home --shell /bin/bash rails \
    && chown -R rails:rails /gala /usr/local/bundle

USER rails
ENTRYPOINT ["./entrypoint.sh"]
CMD ["bundle", "exec", "thrust", "bin/rails", "server", "-b", "0.0.0.0", "-p", "3001"]
