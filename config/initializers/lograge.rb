# frozen_string_literal: true

# Lograge configuration for GC and memory debuger
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

  def format_params(params)
    return nil if params.blank?
    params.transform_values { |v| v.is_a?(String) ? v.truncate(100) : v }
  end

  config.lograge.custom_options = ->(event) do
    exceptions = %w[controller action format id]
    {
      params: format_params(event.payload[:params]&.except(*exceptions)),
      memory: format_memory(`ps -o rss= -p #{Process.pid}`.to_i / 1024),
      gc: format_gc_stats(GC.stat),
      time: Time.current.strftime('%Y-%m-%d %H:%M:%S')
    }
  end

  config.lograge.formatter = ->(data) do
    parts = []
    parts << "🕒 #{data[:time] || Time.current.strftime('%Y-%m-%d %H:%M:%S')}"
    parts << "📍 #{data[:method]} #{data[:path]} [#{data[:status]}]"
    parts << "⏱️  Duration: #{data[:duration]}ms (DB: #{data[:db]}ms, View: #{data[:view]}ms)"
    parts << "💾 Memory: #{data[:memory]}"

    if data[:gc]
      gc = data[:gc]
      parts << "♻️  GC: #{gc[:gc_count]} runs (#{gc[:major_gc]} major, #{gc[:minor_gc]} minor)"
      parts << "📦 Objects: #{gc[:total_objects]}"
    end

    if data[:params].present?
      parts << "🔍 Params: #{data[:params].to_json}"
    end

    if data[:exception]
      parts << "❌ Error: #{data[:exception]} - #{data[:exception_message]}"
    end

    parts.join("\n  ")
  end
end
