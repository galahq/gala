# Jemalloc settings
export MALLOC_CONF="dirty_decay_ms:1000,muzzy_decay_ms:1000,background_thread:true,narenas:2"

# YJIT settings
export RUBY_YJIT_ENABLE=1
export RUBY_YJIT_SIZE_THRESHOLD=30
export RUBY_YJIT_MAX_SIZE=50