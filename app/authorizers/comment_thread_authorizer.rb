# frozen_string_literal: true

# @see CommentThread
class CommentThreadAuthorizer < ApplicationAuthorizer
  # A reader can only delete her own comment thread, unless she’s an editor
  def deletable_by?(reader)
    resource.reader == reader || super
  end
end
