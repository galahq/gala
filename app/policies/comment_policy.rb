# frozen_string_literal: true

# @see Comment
class CommentPolicy < ApplicationPolicy
  def initialize(user, record,
                 forum_policy = ForumPolicy.new(user, record.forum))
    super(user, record)
    @forum_policy = forum_policy
  end

  def destroy?
    user_can_moderate_forum?
  end

  private

  def user_can_moderate_forum?
    @forum_policy.moderate?
  end
end
