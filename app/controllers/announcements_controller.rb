# frozen_string_literal: true

# @see Announcement
class AnnouncementsController < ApplicationController
  # @route [GET] `/announcements`
  def index
    announcements = Announcement.for_reader current_user
    render json: announcements
  end
end
