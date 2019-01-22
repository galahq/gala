# frozen_string_literal: true

# @see Comment
class CommentSerializer < ApplicationSerializer
  attributes :id, :content, :timestamp, :updated_at, :comment_thread_id
  attribute :attachments

  belongs_to :reader, serializer: Readers::IdenticonSerializer

  def attachments
    object.attachments.map do |a|
      { name: a.filename, url: polymorphic_path(a, only_path: true) }
    end
  end
end
