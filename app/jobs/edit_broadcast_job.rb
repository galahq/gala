# frozen_string_literal: true

# Broadcast edits to a case
class EditBroadcastJob < ApplicationJob
  queue_as :high

  def perform(watchable, case_slug:, _cached_params:, type:, session_id:)
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

  # No explicit cache invalidation here: catalog and case-show cache keys are
  # content-addressed (max(updated_at), counts, set fingerprints), so an edit
  # rotates the keys on its own and stale entries age out via TTL. The former
  # delete_matched sweep was a full keyspace SCAN of the Redis instance shared
  # with Sidekiq, fired on every authoring edit — and its patterns never
  # matched the real key layout anyway.
  def broadcast_edit(type: @type)
    EditsChannel.broadcast_to @case_slug,
                              type: type, watchable: serialized_watchable,
                              editor_session_id: @session_id
  end

  def serialized_watchable
    ActiveModel::Serializer.for(@watchable).as_json
  end
end
