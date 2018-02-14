# frozen_string_literal: true

# @see Deployment
class DeploymentPolicy < ApplicationPolicy
  # Since an LTI ContentItemsSelection request creates a new deployment, even
  # a yet-unauthenticated reader from that source can edit that deployment. We
  # know if a user is in the LTI content items selection workflow by storing
  # the selection parameters in the session. This object wraps the current user
  # and those selection parameters
  UserContext = Struct.new(:user, :selection_params) do
    delegate_missing_to :user
  end

  def update?
    return true if selection_params_valid?
    enrollment&.instructor?
  end

  private

  def selection_params_valid?
    return true if editor?
    return false unless user.selection_params
    user.selection_params['context_id'] == record.group.context_id
  end

  def enrollment
    user.enrollment_for_case record.case
  end
end
