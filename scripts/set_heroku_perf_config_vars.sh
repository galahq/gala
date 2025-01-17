#!/bin/bash

##### Set Heroku performance config vars #####

# tuned for 1GB of memory, on heroku-22 stack, running on dyno-2x

#### TODO consider exporting some of this config vars to .profile to avoid heroku build warnings #####

# Clear existing buildpacks
heroku buildpacks:clear --app msc-gala

# Add buildpacks in order
heroku buildpacks:add heroku/metrics --app msc-gala
heroku buildpacks:add https://buildpack-registry.s3.amazonaws.com/buildpacks/heroku-community/apt.tgz --app msc-gala
heroku buildpacks:add https://github.com/candletrick/heroku-22-wkhtmltopdf-buildpack.git --app msc-gala
heroku buildpacks:add https://github.com/brandoncc/heroku-buildpack-vips.git --app msc-gala
heroku buildpacks:add heroku/nodejs --app msc-gala
heroku buildpacks:add heroku/ruby --app msc-gala

# Set config vars
heroku config:set \
  WEB_CONCURRENCY=2 \
  RAILS_MAX_THREADS=3 \
  RAILS_MIN_THREADS=3 \
  LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2 \
  MALLOC_CONF="background_thread:true,metadata_thp:auto,dirty_decay_ms:30000,muzzy_decay_ms:30000,narenas:2" \
  JEMALLOC=1 \
  RUBY_YJIT_ENABLE=1 \
  RUBY_YJIT_MAX_SIZE=30 \
  RUBY_YJIT_SIZE_THRESHOLD=10 \
  --app msc-gala
