# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_reader, :last_active_at

    def connect
      self.current_reader = find_verified_reader
      self.last_active_at = Time.current
      start_cleanup_timer
    end

    def disconnect
      @cleanup_timer&.shutdown
      super
    end

    def received(data)
      self.last_active_at = Time.current
      super
    end

    private

    def start_cleanup_timer
      @cleanup_timer&.shutdown # Clean up any existing timer
      @cleanup_timer = Concurrent::TimerTask.new(execution_interval: 10.minutes) do
        Rails.logger.info { "Checking connection for #{current_reader&.id}" }
        close if connection_inactive?
      end
      @cleanup_timer.execute
    end

    def connection_inactive?
      Time.current - last_active_at > 30.minutes
    end

    def find_verified_reader
      verified_user = env['warden'].user
      return verified_user if verified_user

      reject_unauthorized_connection
    end
  end
end

