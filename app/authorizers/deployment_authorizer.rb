class DeploymentAuthorizer < ApplicationAuthorizer
  def updatable_by? reader, selection_params: nil
    if selection_params
      return true if selection_params['context_id'] == resource.group.context_id
    end

    enrollment = reader.enrollment_for_case resource.case
    return false unless enrollment

    enrollment.instructor?
  end
end
