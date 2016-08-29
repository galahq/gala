class CaseAuthorizer < ApplicationAuthorizer
  def readable_by? reader
    resource.published || reader.has_role?(:reviewer, resource) || reader.can_create?(Case)
  end
end
