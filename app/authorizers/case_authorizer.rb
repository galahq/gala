class CaseAuthorizer < ApplicationAuthorizer
  def readable_by? reader
    resource.published || !reader.enrollment_for_case(resource).nil? || reader.can_create?(Case)
  end
end
