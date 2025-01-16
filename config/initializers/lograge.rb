# frozen_string_literal: true

Rails.application.configure do
  config.lograge.enabled = true

  def format_memory(mb)
    if mb > 1024
      "%.2f GB" % (mb / 1024.0)
    else
      "%.2f MB" % mb
    end
  end

  def format_gc_stats(stats)
    {
      total_objects: stats[:total_allocated_objects].to_s.gsub(/(\d)(?=(\d{3})+(?!\d))/, '\\1,'),
      gc_count: stats[:count],
      major_gc: stats[:major_gc_count],
      minor_gc: stats[:minor_gc_count]
    }
  end

  config.lograge.custom_options = ->(event) do
    exceptions = %w[controller action format id]
    {
      params: event.payload[:params]&.except(*exceptions),
      memory: format_memory(`ps -o rss= -p #{Process.pid}`.to_i / 1024),
      gc: format_gc_stats(GC.stat),
      time: Time.current.strftime('%Y-%m-%d %H:%M:%S')
    }
  end

  config.lograge.formatter = ->(data) {
    details = data.awesome_inspect(multiline: !Rails.env.production?)
    "🔍 Request Stats: #{details}"
  }
end
