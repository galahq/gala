# frozen_string_literal: true

# Broadcast edits to a case
class EditBroadcastJob < ApplicationJob
  queue_as :high

  def perform(watchable, case_slug:, cached_params:, type:, session_id:)
    @watchable = maybe_decorated watchable
    @case_slug = case_slug
    @type = type
    @session_id = session_id

    broadcast_edit
  end

  rescue_from ActiveJob::DeserializationError do |_exception|
    @watchable = @serialized_arguments[1]['cached_params']
    @case_slug = @serialized_arguments[1]['case_slug']
    @session_id = @serialized_arguments[1]['session_id']
    broadcast_edit type: :destroy
  end

  private

  def maybe_decorated(watchable)
    watchable.decorate
  rescue Draper::UninferrableDecoratorError
    watchable
  end

  def broadcast_edit(type: @type)
    EditsChannel.broadcast_to @case_slug,
                              type: type, watchable: serialized_watchable,
                              editor_session_id: @session_id
  end

  def serialized_watchable
    ActiveModel::Serializer.for(@watchable).as_json
  end
end
