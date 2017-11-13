# frozen_string_literal: true

class DeploymentAuthorizer < ApplicationAuthorizer
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
