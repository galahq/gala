# frozen_string_literal: true

# @see Deployment
class DeploymentPolicy < ApplicationPolicy
  # What deployments can this user administrate?
  class AdminScope < Scope
    def resolve
      scope.joins(group: [:group_memberships])
           .where(group_memberships: { reader_id: user.id })
           .merge(GroupMembership.admin)
    end
  end

  # Since an LTI ContentItemsSelection request creates a new deployment, even
  # a yet-unauthenticated reader from that source can edit that deployment. We
  # know if a user is in the LTI content items selection workflow by storing
  # the selection parameters in the session. This object wraps the current user
  # and those selection parameters
  UserContext = Struct.new(:reader, :selection_params) do
    delegate_missing_to :reader
  end

  def show?
    return true if editor?

    group_membership&.admin?
  end

  def update?
    return true if editor?
    return true if selection_params_valid?

    show?
  end

  def destroy?
    show?
  end

  private

  def selection_params_valid?
    return false unless user.try(:selection_params)

    user.selection_params['context_id'] == record.group.context_id
  end

  def group_membership
    user.group_memberships.find_by group_id: record.group_id
  end
end
