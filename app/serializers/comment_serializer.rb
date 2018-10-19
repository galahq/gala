# frozen_string_literal: true

# @see Comment
class CommentSerializer < ApplicationSerializer
  attributes :id, :content, :timestamp, :comment_thread_id
  attribute :attachments
  attribute :reader

  def attachments
    object.attachments.map do |a|
      { name: a.filename, url: polymorphic_path(a, only_path: true) }
    end
  end

  def reader
    object.reader.slice :name, :initials, :id, :image_url, :hash_key
  end
end
