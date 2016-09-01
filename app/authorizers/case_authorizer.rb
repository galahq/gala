class CaseAuthorizer < ApplicationAuthorizer
  def readable_by? reader
    resource.published || reader.enrollment_for_case(resource).try(:reviewer?) || reader.can_create?(Case)
  end
end
