# frozen_string_literal: true

# @abstract
class ApplicationJob < ActiveJob::Base
  queue_as :default

  rescue_from Timeout::Error do |e|
    Rails.logger.error "Job #{self.class.name} timed out: #{e.message}"
    case queue_name.to_s
    when 'critical'
      retry_job wait: 5.seconds if executions < 5
    when 'high'
      retry_job wait: 10.seconds if executions < 5
    when 'default'
      retry_job wait: 30.seconds if executions < 3
    else
      retry_job wait: 60.seconds if executions < 3
    end
  end

  retry_on Redis::ConnectionError, attempts: 3, wait: :exponentially_longer
  retry_on ActiveRecord::Deadlocked, wait: 5.seconds, attempts: 3
  retry_on StandardError, attempts: 3, wait: ->(executions) { executions + 2.seconds }

  discard_on ActiveJob::DeserializationError
end
