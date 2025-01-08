#!/bin/bash

# Enable jemalloc for reduced memory usage and latency.
if [ -f /usr/lib/*/libjemalloc.so.2 ]; then
  export LD_PRELOAD=libjemalloc.so.2
  #export MALLOC_CONF=dirty_decay_ms:1000,narenas:2,background_thread:true
fi



