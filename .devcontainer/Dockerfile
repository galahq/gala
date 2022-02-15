# Fortunately the debian-based Ruby container from dockerhub _is_ available for arm64 (and a zillion other architectures)

# [Choice] Ruby version: 3, 3.0, 2, 2.7, 2.6
ARG VARIANT=2.7
FROM mcr.microsoft.com/vscode/devcontainers/ruby:0-${VARIANT}

# Default value to allow debug server to serve content over GitHub Codespace's port forwarding service
# The value is a comma-separated list of allowed domains
ENV RAILS_DEVELOPMENT_HOSTS=".githubpreview.dev"

# [Choice] Node.js version: lts/*, 16, 14, 12, 10
ARG NODE_VERSION="lts/*"
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends default-mysql-client cmake

# [Optional] Uncomment this line to install additional gems.
RUN gem install rails "bundler:~>2.2.0"

# [Optional] Uncomment this line to install global node packages.
# RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && npm install -g <your-package-here>" 2>&1

WORKDIR /workspace

COPY . /workspace

RUN chown -R vscode /workspace

ENV EDITOR="code --wait"