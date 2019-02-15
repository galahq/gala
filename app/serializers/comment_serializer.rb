# frozen_string_literal: true

# @see Comment
class CommentSerializer < ApplicationSerializer
  # Attachment details for display as download links and preview images
  class AttachmentSerializer < ApplicationSerializer
    attribute(:name) { object.filename }
    attribute(:url) { polymorphic_path(object, only_path: true) }
    attribute :representable
    attribute :size, if: :representable

    def size
      { width: object.metadata[:width], height: object.metadata[:height] }
    end

    def representable
      object.representable?
    end
  end

  attributes :id, :content, :timestamp, :updated_at, :comment_thread_id
  attribute :edited?, key: :edited

  belongs_to :reader, serializer: Readers::IdenticonSerializer
  has_many :attachments, serializer: AttachmentSerializer
end
