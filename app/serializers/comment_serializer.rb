# frozen_string_literal: true

# @see Comment
class CommentSerializer < ApplicationSerializer
  attributes :id, :content, :timestamp, :comment_thread_id
  attribute :attachment_urls
  attribute :reader

  def attachment_urls
    object.attachments.map { |a| polymorphic_path a, only_path: true }
  end

  def reader
    object.reader.slice :name, :initials, :id, :image_url, :hash_key
  end
end
