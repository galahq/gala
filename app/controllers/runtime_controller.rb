# frozen_string_literal: true

require 'socket'

begin
  require 'objspace'
rescue LoadError
  # ObjectSpace.memsize_of_all will simply be skipped if objspace is unavailable.
end

# Surfaces runtime diagnostics for the current Rails process.
class RuntimeController < ApplicationController
  PROCESS_BOOTED_AT = Time.current
  PROCESS_START_MONOTONIC = Process.clock_gettime(Process::CLOCK_MONOTONIC)

  skip_before_action :verify_authenticity_token, raise: false

  # @route [GET] `/runtime/stats`
  def stats
    snapshot = RuntimeStatsSnapshot.new(runtime_stats_payload)
    render json: RuntimeStatsSerializer.new(
      snapshot,
      view_context: view_context
    ).as_json
  end

  private

  def runtime_stats_payload
    data = {
      captured_at: Time.current,
      environment: environment_stats,
      process: process_stats,
      gc: gc_stats,
      heap: heap_stats,
      objects: object_stats,
      caches: cache_stats,
      redis: redis_stats,
      postgres: postgres_stats,
      sidekiq: sidekiq_stats,
      action_cable: action_cable_stats
    }

    data[:warnings] = warning_messages(data)
    data
  end

  def environment_stats
    {
      rails_env: Rails.env,
      rails_version: Rails.version,
      ruby_version: RUBY_VERSION,
      ruby_platform: RUBY_PLATFORM,
      bundler_version: defined?(Bundler) ? Bundler::VERSION : nil,
      hostname: Socket.gethostname,
      node_version: ENV['NODE_VERSION'],
      commit_sha: ENV['HEROKU_SLUG_COMMIT'] || ENV['GIT_COMMIT'] || ENV['COMMIT_SHA']
    }.compact
  end

  def process_stats
    {
      pid: Process.pid,
      booted_at: PROCESS_BOOTED_AT,
      uptime_seconds: (Process.clock_gettime(Process::CLOCK_MONOTONIC) - PROCESS_START_MONOTONIC).round(2),
      threads: Thread.list.count,
      resident_set_mb: resident_set_size_mb,
      cpu_usage: cpu_usage_percentage
    }.compact
  end

  def gc_stats
    stats = GC.stat
    data = stats.slice(
      :count,
      :minor_gc_count,
      :major_gc_count,
      :total_allocated_objects,
      :total_freed_objects,
      :heap_allocated_pages,
      :malloc_increase_bytes,
      :remembered_wb_unprotected_objects
    )
    if GC.respond_to?(:latest_gc_info)
      latest = GC.latest_gc_info
      data[:latest_gc_reason] = latest[:reason]
      data[:latest_gc_finished_at] = latest[:end_time]
    end
    data
  end

  def heap_stats
    stats = GC.stat
    {
      heap_live_slots: stats[:heap_live_slots],
      heap_free_slots: stats[:heap_free_slots],
      heap_available_slots: stats[:heap_available_slots],
      heap_used: stats[:heap_used],
      memsize_mb: memsize_mb
    }.compact
  end

  def object_stats
    return {} unless defined?(ObjectSpace)

    counts = ObjectSpace.count_objects
    {
      total: counts[:TOTAL],
      free: counts[:FREE],
      strings: counts[:T_STRING],
      arrays: counts[:T_ARRAY],
      hashes: counts[:T_HASH],
      objects: counts[:T_OBJECT]
    }
  rescue StandardError => e
    { error: e.class.name, message: e.message }
  end

  def cache_stats
    store = Rails.cache
    data = { store: store.class.name }
    if store.respond_to?(:stats)
      data[:stats] = store.stats
    end
    data
  rescue StandardError => e
    { store: Rails.cache.class.name, error: e.class.name, message: e.message }
  end

  def redis_stats
    return {} unless defined?(Redis)

    redis_url = ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')
    redis = Redis.new(url: redis_url)
    info = redis.info

    info.slice(
      'connected_clients',
      'used_memory_human',
      'used_memory_peak_human',
      'uptime_in_seconds',
      'role'
    ).merge(server: redis.connection[:host])
  rescue StandardError => e
    { error: e.class.name, message: e.message }
  end

  def postgres_stats
    pool = ActiveRecord::Base.connection_pool

    data = pool.respond_to?(:stat) ? pool.stat : {}
    if ActiveRecord::Base.respond_to?(:connection_db_config)
      data[:database] = ActiveRecord::Base.connection_db_config.database
    end
    data
  rescue StandardError => e
    { error: e.class.name, message: e.message }
  end

  def sidekiq_stats
    return {} unless defined?(Sidekiq::Stats)

    stats = Sidekiq::Stats.new
    {
      processed: stats.processed,
      failed: stats.failed,
      enqueued: stats.enqueued,
      scheduled_size: stats.scheduled_size,
      retry_size: stats.retry_size,
      dead_size: stats.dead_size
    }
  rescue StandardError => e
    { error: e.class.name, message: e.message }
  end

  def action_cable_stats
    return {} unless defined?(ActionCable)

    server = ActionCable.server
    {
      adapter: server.config.cable.fetch(:adapter, 'redis'),
      allowed_request_origins: server.config.allowed_request_origins,
      connection_count: safe_connection_count(server)
    }.compact
  rescue StandardError => e
    { error: e.class.name, message: e.message }
  end

  def warning_messages(data)
    warnings = []
    rss = data.dig(:process, :resident_set_mb).to_f
    warnings << 'Process RSS exceeds 1500 MB' if rss.positive? && rss >= 1500

    pool_stats = data[:postgres] || {}
    size = (pool_stats[:size] || pool_stats['size']).to_i
    busy = (pool_stats[:busy] || pool_stats['busy']).to_i
    if size.positive? && busy >= size
      warnings << 'Postgres connection pool is saturated'
    end

    warnings
  end

  def memsize_mb
    return unless defined?(ObjectSpace) && ObjectSpace.respond_to?(:memsize_of_all)

    (ObjectSpace.memsize_of_all / (1024.0 * 1024)).round(2)
  rescue StandardError
    nil
  end

  def resident_set_size_mb
    rss_kb = `ps -o rss= -p #{Process.pid}`.to_i
    return if rss_kb <= 0

    (rss_kb / 1024.0).round(2)
  rescue StandardError
    nil
  end

  def cpu_usage_percentage
    return unless RUBY_PLATFORM.include?('linux') || RUBY_PLATFORM.include?('darwin')

    stat = `ps -o %cpu= -p #{Process.pid}`.to_f
    stat.positive? ? stat.round(2) : nil
  rescue StandardError
    nil
  end

  def safe_connection_count(server)
    return unless server.respond_to?(:connections)

    Array(server.connections).count
  end
end

