# frozen_string_literal: true

module ApplicationCable
  # Handles WebSocket connections for Action Cable, managing reader authentication
  # and connection lifecycle.
  class Connection < ActionCable::Connection::Base
    identified_by :current_reader

    def connect
      self.current_reader = find_verified_reader
      start_cleanup_timer
    end

    private

    def start_cleanup_timer
      # Check every 30 minutes and close if inactive
      Rails.application.executor.wrap do
        @cleanup_timer = Thread.new do
          sleep 30.minutes
          Rails.logger.info { "Closing connection for #{current_reader&.id}" }
          close
        end
      end
    end

    def find_verified_reader
      verified_user = env['warden'].user
      return verified_user if verified_user

      reject_unauthorized_connection
    end
  end
end
