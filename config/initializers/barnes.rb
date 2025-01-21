# frozen_string_literal: true

require 'barnes'
Barnes.start

# Configure Barnes for reporting GC, memory, and other metrics
# Barnes.start do |config|
#   # Report GC.stat data
#   config.statsd_client = :statsd

#   # Sample every 10 seconds
#   config.interval = 10

#   # Report memory usage
#   config.gauge 'memory.allocated', unit: :bytes do
#     GC.stat[:total_allocated_objects] * GC::INTERNAL_CONSTANTS[:RVALUE_SIZE]
#   end

#   # Report GC stats
#   config.gauge 'gc.heap_slots' do
#     GC.stat[:heap_available_slots]
#   end

#   config.gauge 'gc.heap_live_slots' do
#     GC.stat[:heap_live_slots]
#   end

#   # Report process memory usage
#   config.gauge 'process.memory', unit: :mb do
#     `ps -o rss= -p #{Process.pid}`.to_i / 1024.0
#   end
# end
