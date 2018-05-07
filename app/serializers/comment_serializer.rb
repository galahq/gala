# frozen_string_literal: true

# @see Comment
class CommentSerializer < ApplicationSerializer
  attributes :id, :content, :timestamp, :comment_thread_id
  attribute :reader

  def reader
    object.reader.slice :name, :initials, :id, :image_url, :hash_key
  end
end
