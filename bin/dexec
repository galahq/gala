#!/usr/bin/env bash

set -eu  # do not proceed on error

if [ $# -lt 1 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ];  then
cat <<EOF
Quick command to get a shell inside a running docker container.

Usage: dexec [container_name] [command]

container_name - partial name of container you wish to enter.
command        - command to run inside container. If not provided, defaults to /bin/sh

Examples:
$ dexec backend
$ dexec frontend
$ dexec backend rails test test/models/location_test.rb
$ dexec backend logs
EOF
exit
fi

# assign first argument to variable and shift arguments
container_name=$1
cmd="/bin/sh"
shift
if [ $# -gt 0 ]; then
  cmd="$*"
fi

ps_flags=""
if [ "$cmd" = "logs" ]; then
  ps_flags="-a"
fi

container_line="$(docker ps $ps_flags | grep "$container_name" | head -n1)"
if [ -z "$container_line" ]; then
  echo "could not find any running containers for $container_name"
  exit 1
fi

container_id="$(echo "$container_line" | awk '{print $1;}')"
docker_command="docker exec -it $container_id $cmd"
if [ "$cmd" = "logs" ]; then
  docker_command="docker logs $container_id"
fi

cat <<EOF
found a container matching input: "$container_name"
    $container_line
        executing: $docker_command
EOF

$docker_command