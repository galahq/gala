FROM ruby:2.4-alpine

RUN apk add --update tzdata && \
    cp /usr/share/zoneinfo/Europe/London /etc/localtime && \
    echo "Europe/London" > /etc/timezone

RUN apk add --update --virtual runtime-deps postgresql-client libffi-dev readline nodejs

# Bundle into the temp directory
WORKDIR /tmp
COPY Gemfile* ./

RUN apk add --virtual build-deps build-base openssl-dev postgresql-dev libc-dev linux-headers libxml2-dev libxslt-dev readline-dev git && \
    bundle install --jobs=2 && \
    apk del build-deps
RUN echo -e 'http://dl-cdn.alpinelinux.org/alpine/edge/main\nhttp://dl-cdn.alpinelinux.org/alpine/edge/community\nhttp://dl-cdn.alpinelinux.org/alpine/edge/testing' > /etc/apk/repositories && \
    apk add --no-cache yarn

# Copy the app's code into the container
ENV APP_HOME /app
COPY . $APP_HOME
WORKDIR $APP_HOME

# Configure production environment variables
ENV RAILS_ENV=production \
    RACK_ENV=production

# Expose port 3000 from the container
EXPOSE 3000
EXPOSE 3001

# Run puma server by default
CMD ["foreman", "start"]
