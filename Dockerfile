# Use the official Ruby 2.6.6 image as the base image
FROM ruby:2.6.6

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
  build-essential curl

# Install Node.js 12.x
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs yarn

# Copy the Gemfile and Gemfile.lock into the container
COPY Gemfile Gemfile.lock ./

# Install Ruby dependencies
RUN echo "gem: --no-rdoc --no-ri" > /etc/gemrc
RUN gem install bundler && bundle install --jobs 20 --retry 5

# Copy the main application into the container
COPY . .

# Install JavaScript dependencies
# RUN yarn install

# Set environment variables
ENV RAILS_ENV=production

# Compile assets only in production environment
RUN if [ "$RAILS_ENV" = "production" ]; then \
      bundle exec rake assets:precompile && \
      yarn install --check-files; \
    fi

# Expose port 3000 to the Docker host
EXPOSE 3000

# Start the Rails server
CMD ["rails", "server", "-b", "0.0.0.0"]
