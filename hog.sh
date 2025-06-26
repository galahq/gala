#!/bin/bash

dir=${1:-"$PWD"}

du -ah "$dir" | sort -rh | head -n 10