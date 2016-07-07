class CaseAuthorizer < ApplicationAuthorizer
  def readable_by? reader
    resource.published? || reader.can_create?(Case)
  end
end
