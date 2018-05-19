# frozen_string_literal: true

# Broadcast edits to a case as they are persisted
class EditsChannel < ApplicationCable::Channel
  def subscribed
    stream_for params[:case_slug] if user_can_read_case
  end

  private

  def user_can_read_case
    Pundit.policy(current_reader, kase).show?
  end

  def kase
    Case.friendly.find params[:case_slug]
  rescue ActiveRecord::RecordNotFound
    reject
  end
end
