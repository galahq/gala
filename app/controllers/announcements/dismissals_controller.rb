# frozen_string_literal: true

module Announcements
  # A user dismisses an announcement when they click the X button
  class DismissalsController < ApplicationController
    before_action :authenticate_reader!

    # @param [POST] `/announcements/1/dismissal`
    def create
      current_reader.seen_announcements_created_before = announcement.created_at
      current_reader.save
      head :no_content
    end

    private

    def announcement
      Announcement.find params[:announcement_id]
    end
  end
end
