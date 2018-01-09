# frozen_string_literal: true

# @see Deployment
class DeploymentAuthorizer < ApplicationAuthorizer
  # Instructors and editors are the only ones who can edit deployments.
  # Since an LTI ContentItemsSelection request creates a new deployment, even
  # a yet-unauthenticated reader from that source can edit that deployment
  def updatable_by?(reader, selection_params: nil)
    return true if reader.has_role? :editor

    if selection_params
      return true if selection_params['context_id'] == resource.group.context_id
    end

    enrollment = reader.enrollment_for_case resource.case
    return false unless enrollment

    enrollment.instructor?
  end
end
