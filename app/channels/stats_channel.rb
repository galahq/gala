# frozen_string_literal: true

# Broadcasts stats updates when new Ahoy events are created for a case.
# Clients subscribe with their case_slug to receive real-time notifications.
class StatsChannel < ApplicationCable::Channel
  # Broadcast that new stats are available for a case.
  # Called from Ahoy::Event after_commit callback.
  # @param case_slug [String] The slug of the case with new events
  def self.broadcast_stats_updated(case_id:)
    ActionCable.server.broadcast(
      "stats:#{case_id}",
      { type: 'stats_updated', case_id: case_id }
    )
  end

  def subscribed
    @case = Case.find_by(id: params[:case_id])
    return reject unless @case && user_can_view_stats?

    stream_from stream_name
  end

  private

  def stream_name
    "stats:#{@case.id}"
  end

  def user_can_view_stats?
    Pundit.policy(current_reader, @case).stats?
  rescue Pundit::NotDefinedError, Pundit::NotAuthorizedError
    false
  end
end
