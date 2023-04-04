FROM mcr.microsoft.com/devcontainers/base:bullseye

# Default value to allow debug server to serve content over GitHub Codespace's port forwarding service
# The value is a comma-separated list of allowed domains
# requires Rails 7, otherwise config in config/environments/development.rb
ENV RAILS_DEVELOPMENT_HOSTS=".githubpreview.dev,.preview.app.github.dev,.app.github.dev"

# the ruby build seems to expect mkdir in /usr/bin. It's not clear what the
# root cause is for this but this symlink works around it for now - 2 March 2023
RUN ln -s /bin/mkdir /usr/bin/mkdir

# [Optional] Uncomment this section to install additional OS packages.
# shared-mime-info for an image gem
# python2 for old node packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        iputils-ping \
        libpq-dev postgresql-client \
        shared-mime-info \
        python2 \
        cmake

ENV EDITOR="code --wait"
