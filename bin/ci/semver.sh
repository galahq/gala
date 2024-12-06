#!/bin/bash

# File to store the version number
version_file="$PROJECT_ROOT/version.txt"

# Initialize the version file if it doesn't exist
[[ -f $version_file ]] || echo "0.0.0" > "$version_file"

# Read and parse the version number
version=$(<"$version_file")
IFS='.' read -r major minor build <<< "$version"

# Increment the version based on the input argument
case $1 in
  build)
    ((build++))
    ;;
  minor)
    ((minor++))
    build=0
    ;;
  major)
    ((major++))
    minor=0
    build=0
    ;;
  read)
    echo "$version"
    exit 0
    ;;
  *)
    echo "Usage: $0 [major|minor|build|read] [save]"
    exit 1
    ;;
esac

# Construct the new version string
new_version="$major.$minor.$build"

# Optionally save the new version to the file
if [[ $2 == "save" ]]; then
  echo "$new_version" > "$version_file"
fi

# Output the new version
echo "$new_version"
