# frozen_string_literal: true

# @see Comment
class CommentPolicy < ApplicationPolicy
  def destroy?
    editor? || (author? && in_global_community?) || admin_for_comment_group?
  end

  private

  def author?
    user.my_cases.include?(record.forum.case)
  end

  def in_global_community?
    record.community.global?
  end

  def admin_for_comment_group?
    record.community.memberships
          .merge(user.group_memberships)
          .merge(GroupMembership.admin)
          .exists?
  end
end
