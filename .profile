export LD_PRELOAD="libjemalloc.so.2"
export MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true"
export RUBY_YJIT_ENABLE="1"