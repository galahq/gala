# frozen_string_literal: true

# @see Forum
class ForumPolicy < ApplicationPolicy
  # What forums can a user participate in?
  class Scope < Scope
    def resolve
      scope.joins(:case).where(
        case: user.enrolled_cases,
        id: scope.where(community: user.communities)
                 .or(GlobalCommunity.instance.forums)
      )
    end
  end

  # Someone who can moderate a forum can delete others' comments in it
  def moderate?
    editor? || (author? && in_global_community?) || group_admin?
  end

  private

  def author?
    user.my_cases.include?(record.case)
  end

  def in_global_community?
    record.community.global?
  end

  def group_admin?
    record.community.memberships
          .merge(user.group_memberships)
          .merge(GroupMembership.admin)
          .exists?
  end
end
