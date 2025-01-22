# frozen_string_literal: true

class RuntimeController < ApplicationController
  before_action :authenticate_reader!
  before_action -> do
    # only allow editors to view this page
    redirect_to '/403' unless current_reader&.has_role?(:editor)
  end

  def stats
    response.headers['Content-Type'] = 'text/html'
    render html: generate_stats_text.html_safe
  end

  private

  def generate_stats_text
    stats = collect_stats
    <<~HTML
      <div style="
        display: flex;
        border-radius: 8px;
        background: #1e1e1e;
      ">
        <pre style="
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          padding: 10px;
          color: #d4d4d4;
          line-height: 1.5;
          font-size: 14px;
          max-width: 900px;
        ">
        <span style="color: #569cd6; font-weight: bold;">&#x1F3AF; APPLICATION RUNTIME METRICS</span>
        <span style="color: #888888;">Generated at: #{format_time(Time.current)}</span>

        <span style="color: #4ec9b0;">&#x1F5A5; SYSTEM</span>
        #{format_section(stats[:system])}

        <span style="color: #4ec9b0;">&#x267B; RUBY RUNTIME</span>
        #{format_section(stats[:ruby])}

        <span style="color: #4ec9b0;">&#x1F4E6; REDIS</span>
        #{format_section(stats[:redis])}

        <span style="color: #4ec9b0;">&#x1F977; SIDEKIQ</span>
        #{format_section(stats[:sidekiq])}

        <span style="color: #4ec9b0;">&#x1F418; POSTGRES</span>
        #{format_section(stats[:database])}

        <span style="color: #4ec9b0;">&#x1F6E1; RACK ATTACK</span>
        #{format_section(stats[:request])}
        </pre>
        <div style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(30, 30, 30, 0.8);
          color: #d4d4d4;
          padding: 8px 16px;
          border-radius: 4px;
          font-family: system-ui;
          font-size: 12px;
        ">
          Refreshing in <span id="countdown">30</span>s
        </div>
      </div>
      <script>
        let countdown = 10;
        setInterval(() => {
          countdown--;
          document.getElementById('countdown').textContent = countdown;
          if (countdown <= 0) window.location.reload();
        }, 1000);
      </script>
    HTML
  end

  def collect_stats
    {
      system: collect_system_stats,
      ruby: collect_ruby_stats,
      redis: collect_redis_stats,
      sidekiq: collect_sidekiq_stats,
      database: collect_database_stats,
      request: collect_request_stats,
      cable: collect_actioncable_stats
    }
  end

  def collect_system_stats
    {
      os: os_version,
      memory: collect_process_memory,
      ruby_memory_usage: collect_ruby_memory_percentage,
      processes: collect_process_number,
      malloc_conf: ENV['MALLOC_CONF'],
      jemalloc: check_jemalloc_for_pid
    }
  rescue StandardError => e
    { error: e.message }
  end

  def collect_process_number
    if ENV['DYNO'] # Check if running on Heroku
      # Use environment variables or Heroku-specific methods
      counts = {
        puma: ENV['WEB_CONCURRENCY'].to_i || 0,
        sidekiq: Sidekiq::ProcessSet.new.size
      }
    else
      counts = {
        puma: `ps aux | grep [p]uma | wc -l`.strip.to_i,
        sidekiq: `ps aux | grep [s]idekiq | wc -l`.strip.to_i
      }
    end
    total = counts.values.sum
    "#{total} (Puma: #{counts[:puma]}, Sidekiq: #{counts[:sidekiq]})"
  end

  def collect_process_memory
    if ENV['DYNO'] # Check if running on Heroku
      # Use process memory from GetProcessMem gem or similar
      memory = {
        puma: get_memory_for_type('web'),
        sidekiq: get_memory_for_type('worker')
      }
    else
      memory = {
        puma: `ps aux | grep [p]uma | awk '{sum += $6} END {print sum}'`.strip.to_i,
        sidekiq: `ps aux | grep [s]idekiq | awk '{sum += $6} END {print sum}'`.strip.to_i
      }
    end

    total = memory.values.sum

    "Total: #{format_memory(total / 1024.0)} " \
    "Puma: #{format_memory(memory[:puma] / 1024.0)}, " \
    "Sidekiq: #{format_memory(memory[:sidekiq] / 1024.0)})"
  end

  def get_memory_for_type(dyno_type)
    return 0 unless ENV['DYNO']&.start_with?(dyno_type)
    GetProcessMem.new.bytes.to_i / 1024 # Convert to KB
  end

  def check_jemalloc_for_pid
    pid = Process.pid
    executable_path = File.readlink("/proc/#{pid}/exe") rescue RbConfig.ruby

    # Check libraries loaded by the current process
    ldd_output = `ldd #{executable_path} 2>/dev/null`

    if ldd_output.include?('libjemalloc.so')
      version = `ldconfig -p | grep libjemalloc.so | head -n1`.split.last rescue 'version unknown'
      "enabled (#{version})"
    else
      # Double check maps file for dynamic loading
      maps = File.read("/proc/#{pid}/maps") rescue ''
      if maps.include?('libjemalloc.so')
        'enabled (dynamically loaded)'
      else
        'disabled'
      end
    end
  rescue StandardError => e
    "check failed: #{e.message}"
  end

  def os_version
    case RbConfig::CONFIG['host_os']
    when /darwin/
      "macOS #{`sw_vers -productVersion`.strip}"
    when /linux/
      if File.exist?('/etc/os-release')
        os_release = File.read('/etc/os-release')
        pretty_name = os_release[/PRETTY_NAME="(.+)"/, 1]
        pretty_name || `uname -sr`.strip
      else
        `uname -sr`.strip
      end
    else
      RbConfig::CONFIG['host_os']
    end
  rescue StandardError => e
    "Unknown OS (#{e.message})"
  end

  def collect_ruby_stats
    gc_stats = GC.stat
    {
      ruby_engine: "#{RUBY_ENGINE} #{RUBY_VERSION}p#{RUBY_PATCHLEVEL rescue nil}",
      ruby_platform: RUBY_PLATFORM,
      ruby_patchlevel: RUBY_PATCHLEVEL,
      yjit_enabled: RubyVM::YJIT.enabled?,
      yjit: collect_yjit_stats,
      jemalloc: collect_jemalloc_stats,
      gc_count: gc_stats[:count],
      major_gc: gc_stats[:major_gc_count],
      minor_gc: gc_stats[:minor_gc_count],
      heap_slots: "#{gc_stats[:heap_live_slots]} live / #{gc_stats[:heap_free_slots]} free",
      objects: collect_object_stats.to_yaml
    }.compact
  rescue StandardError => e
    { error: e.message }
  end

  def collect_redis_stats
    redis = Sidekiq.redis_pool.with { |conn| conn } rescue Redis.current
    info = redis.info

    {
      version: info['redis_version'],
      uptime: "#{info['uptime_in_days']} days",
      connected_clients: info['connected_clients'],
      memory_used: format_memory(info['used_memory'].to_i / 1024 / 1024),
      memory_peak: format_memory(info['used_memory_peak'].to_i / 1024 / 1024),
      keys: redis.dbsize
    }
  rescue StandardError => e
    { error: e.message }
  end

  def collect_sidekiq_stats
    stats = Sidekiq::Stats.new
    processes = Sidekiq::ProcessSet.new

    {
      processes: processes.size,
      queues: Sidekiq::Queue.all.map { |q| "#{q.name}:#{q.size}" }.join(', '),
      enqueued: stats.enqueued,
      processed: stats.processed,
      failed: stats.failed,
      busy_workers: stats.workers_size
    }
  rescue StandardError => e
    { error: e.message }
  end

  def collect_database_stats
    {
      version: pg_version,
      active_connections: active_connections,
      max_connections: max_connections,
      connection_stats: connection_stats,
      db_size: database_size,
      cache_hit_ratio: cache_hit_ratio,
      deadlocks: deadlocks,
      conflicts: conflicts,
      oldest_transaction: oldest_transaction_age
    }
  rescue StandardError => e
    { error: e.message }
  end

  def collect_request_stats
    {
      rate_limited_keys: collect_rate_limited_count,
      cache_stats: collect_cache_stats
    }
  rescue StandardError => e
    { error: e.message }
  end

  def collect_yjit_stats
    return nil unless defined?(RubyVM::YJIT) && RubyVM::YJIT.enabled?

    stats = RubyVM::YJIT.runtime_stats
    compiled = stats[:compiled_iseq_count] || 0
    exits = stats[:exit_count] || 0

    # Convert bytes to MB directly since YJIT code size is reported in bytes
    inline_size = (stats[:inline_code_size].to_f / 1024 / 1024).round(2)
    outlined_size = (stats[:outlined_code_size].to_f / 1024 / 1024).round(2)

    "compiled: #{compiled}, exits: #{exits}, " \
    "inline_code_size: #{inline_size}MB, " \
    "outlined_code_size: #{outlined_size}MB"
  end

  def collect_jemalloc_stats
    return nil unless check_jemalloc_for_pid.include?('enabled')

    begin
      # Use mallctl to get stats directly from jemalloc
      stats = {}
      IO.popen("MALLOC_CONF=stats_print:true #{RbConfig.ruby} -e 'exit'", err: [:child, :out]) do |io|
        output = io.read
        stats[:allocated] = output[/current_allocated_bytes:\s+(\d+)/, 1].to_i
        stats[:active] = output[/active_bytes:\s+(\d+)/, 1].to_i
        stats[:resident] = output[/resident_bytes:\s+(\d+)/, 1].to_i
        stats[:mapped] = output[/mapped_bytes:\s+(\d+)/, 1].to_i
      end

      "allocated: #{format_memory(stats[:allocated] / 1024.0 / 1024.0)}, " \
      "active: #{format_memory(stats[:active] / 1024.0 / 1024.0)}, " \
      "resident: #{format_memory(stats[:resident] / 1024.0 / 1024.0)}, " \
      "mapped: #{format_memory(stats[:mapped] / 1024.0 / 1024.0)}"
    rescue StandardError => e
      "Error: #{e.message}"
    end
  end

  def collect_rate_limited_count
    return 0 unless defined?(Rack::Attack)

    Sidekiq.redis { |redis| redis.keys('rack::attack:*').count }
  end

  def collect_cache_stats
    stats = Rails.cache.stats
    hits = stats[:hits].to_i
    misses = stats[:misses].to_i
    total = hits + misses

    ratio = total.positive? ? (hits.to_f / total * 100).round(2) : 0
    "#{hits} hits / #{misses} misses (#{ratio}% hit ratio)"
  end

  def collect_object_stats
    require 'objspace'
    stats = {}

    ObjectSpace.count_objects(stats)
    total_memory = ObjectSpace.memsize_of_all

    {
      "total": stats[:TOTAL],
      "free": stats[:FREE],
      "t_object": stats[:T_OBJECT],
      "t_string": stats[:T_STRING],
      "t_array": stats[:T_ARRAY],
      "t_hash": stats[:T_HASH],
      "memory": format_memory(total_memory / 1024.0 / 1024.0)
    }
  rescue StandardError => e
    Rails.logger.error("Object stats collection failed: #{e.message}")
    nil
  end

  def format_section(data)
    return %(<span style="color: #f44747;">  ERROR: #{data[:error]}</span>) if data[:error]

    %(  <dl style="
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: 180px auto;
      gap: 2px;
    ">
      #{data.map do |key, value|
        next if value.nil?

        label = key.to_s.tr('_', ' ').upcase
        %(    <dt style="
          color: #888888;
          grid-column: 1;
          padding: 2px 0;
          text-align: right;
        ">#{label}:</dt>
      <dd style="
          color: #d4d4d4;
          grid-column: 2;
          margin: 0;
          padding: 2px 0;
          padding-left: 10px;
        ">#{value}</dd>)
      end.compact.join("\n")}
    </dl>)
  end

  def format_time(time)
    time.in_time_zone('America/Detroit').strftime('%B %d, %Y at %I:%M:%S %p %Z')
  end

  def format_memory(mb)
    mb > 1024 ? format('%.2f GB', (mb / 1024.0)) : "#{mb.round(2)} MB"
  end

  def pg_version
    execute('SHOW server_version').first['server_version']
  end

  def active_connections
    execute('SELECT count(*) FROM pg_stat_activity').first['count']
  end

  def max_connections
    execute('SHOW max_connections').first['max_connections']
  end

  def connection_stats
    stats = execute(<<-SQL)
      SELECT
        state,
        count(*) as count
      FROM pg_stat_activity
      GROUP BY state
    SQL
    stats.map { |s| "#{s['state']}: #{s['count']}" }.join(', ')
  end

  def database_size
    size = execute('SELECT pg_database_size(current_database())').first['pg_database_size']
    format_memory(size / 1024.0 / 1024.0)
  end

  def cache_hit_ratio
    result = execute(<<-SQL)
      SELECT
        sum(heap_blks_hit) as hits,
        sum(heap_blks_hit + heap_blks_read) as total
      FROM pg_statio_user_tables
    SQL
    hits = result.first['hits'].to_f
    total = result.first['total'].to_f
    return 0.0 if total.zero?

    "#{((hits / total) * 100).round(2)}%"
  end

  def deadlocks
    execute(<<-SQL).first['deadlocks']
      SELECT deadlocks
      FROM pg_stat_database
      WHERE datname = current_database()
    SQL
  end

  def conflicts
    execute(<<-SQL).first['conflicts']
      SELECT conflicts
      FROM pg_stat_database
      WHERE datname = current_database()
    SQL
  end

  def oldest_transaction_age
    age = execute('SELECT extract(epoch from max(now() - xact_start)) as age FROM pg_stat_activity').first['age']
    return 'N/A' unless age

    "#{age.to_i} seconds"
  end

  def execute(sql)
    ActiveRecord::Base.connection.execute(sql)
  end

  def collect_ruby_memory_percentage
    case RbConfig::CONFIG['host_os']
    when /linux/
      # Get total system memory from /proc/meminfo
      total_memory_kb = File.read('/proc/meminfo')[/MemTotal:\s+(\d+)/, 1].to_i

      # Get total Ruby processes memory
      ruby_memory_kb = `ps aux | grep -E '[r]uby|[p]uma|[s]idekiq' | awk '{sum += $6} END {print sum}'`.to_i

      # Calculate percentage and format output
      percentage = (ruby_memory_kb.to_f / total_memory_kb * 100).round(2)
      "#{format_memory(ruby_memory_kb / 1024.0)} of #{format_memory(total_memory_kb / 1024.0)} (#{percentage}%)"
    when /darwin/
      # Get total system memory from sysctl
      total_memory_bytes = `sysctl -n hw.memsize`.to_i
      total_memory_kb = total_memory_bytes / 1024

      # Get total Ruby processes memory
      ruby_memory_kb = `ps aux | grep -E '[r]uby|[p]uma|[s]idekiq' | awk '{sum += $6} END {print sum}'`.to_i

      # Calculate percentage and format output
      percentage = (ruby_memory_kb.to_f / total_memory_kb * 100).round(2)
      "#{format_memory(ruby_memory_kb / 1024.0)} of #{format_memory(total_memory_kb / 1024.0)} (#{percentage}%)"
    else
      'Unsupported OS'
    end
  rescue StandardError => e
    "Error calculating memory: #{e.message}"
  end

  def collect_actioncable_stats
    return unless defined?(ActionCable::Server::Base)

    server = ActionCable.server
    connections = server.connections
    pubsub_adapter = server.pubsub

    {
      connections: connections.count,
      # channels: collect_channel_stats(connections),
      adapter: pubsub_adapter.class.name.demodulize
    }.compact
  end
end
