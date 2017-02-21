class CommentThreadAuthorizer < ApplicationAuthorizer
  def deletable_by? reader
    resource.reader == reader || super
  end
end
