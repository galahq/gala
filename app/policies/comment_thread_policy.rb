# frozen_string_literal: true

# @see CommentThread
class CommentThreadPolicy < ApplicationPolicy
  def destroy?
    return false unless record.comments.empty?
    record.reader == user || editor?
  end
end
