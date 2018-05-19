# frozen_string_literal: true

# Broadcast edits to a case
class EditBroadcastJob < ActiveJob::Base
  queue_as :default

  def perform(watchable, case_slug:, cached_params:)
    @watchable = watchable
    @case_slug = case_slug

    broadcast_edit
  end

  rescue_from ActiveJob::DeserializationError do |_exception|
    @watchable = @serialized_arguments[1]['cached_params']
    @case_slug = @serialized_arguments[1]['case_slug']
    broadcast_edit type: :destroyed
  end

  private

  def broadcast_edit(type: edit_type)
    EditsChannel.broadcast_to @case_slug,
                              type: type, watchable: serialized_watchable
  end

  def edit_type
    if updated?
      :updated
    else
      :created
    end
  end

  def updated?
    @watchable.created_at != @watchable.updated_at
  end

  def serialized_watchable
    ActiveModel::Serializer.for(@watchable).as_json
  end
end
