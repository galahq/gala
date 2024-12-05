#!/bin/bash

# Define the base path for gems relative to the project directory
gem_path="vendor/bundle/ruby"

# Dynamically find the major and minor Ruby version, appending `.0`
ruby_version=$(ruby -e 'puts RUBY_VERSION.split(".")[0..1].join(".") + ".0"')

# Construct the full path
full_gem_path="${gem_path}/${ruby_version}/gems"

# Check if the directory exists
if [[ -d $full_gem_path ]]; then
    # List disk usage sorted by size
    du -sh "${full_gem_path}"/* | sort -h
else
    echo "Gems directory not found: $full_gem_path"
    exit 1
fi

