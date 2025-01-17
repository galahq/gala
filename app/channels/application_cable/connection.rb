# frozen_string_literal: true

module ApplicationCable
  # Only authenticated {Reader}s can subscribe to a cable
  class Connection < ActionCable::Connection::Base
    identified_by :current_reader

    def connect
      self.current_reader = find_verified_reader
    end

    private

    # Add periodic cleanup
    periodic_timers.push(every: 3600) do
      # Cleanup old connections
      transmit(type: 'ping')
    end

    def find_verified_reader
      if (verified_user = env['warden'].user)
        verified_user
      else
        reject_unauthorized_connection
      end
    end
  end
end
