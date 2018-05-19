# frozen_string_literal: true

# Broadcast edits to a case as they are persisted
class EditsChannel < ApplicationCable::Channel
  def subscribed
    stream_for find_case
  end

  private

  def find_case
    Case.friendly.find params[:case_slug]
  rescue ActiveRecord::RecordNotFound
    reject
  end
end
