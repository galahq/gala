#!/bin/bash

echo "$(date '+%Y.%m.%dT%H%M')-$(git rev-parse --short HEAD)"