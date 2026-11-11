# frozen_string_literal: true

module ApplicationCable
  # Only authenticated {Reader}s can subscribe to a cable
  class Connection < ActionCable::Connection::Base
    identified_by :current_reader

    def connect
      self.current_reader = find_verified_reader
    end

    private

    def find_verified_reader
      verified_user = env['warden'].user
      # A closed reader gets no live updates or notifications (W4, W6).
      if verified_user && !verified_user.closed?
        verified_user
      else
        reject_unauthorized_connection
      end
    end
  end
end
