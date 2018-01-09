# frozen_string_literal: true

# @see Case
class CaseAuthorizer < ApplicationAuthorizer
  # Readers can only read unpublished cases if they have been enrolled (e.g.) by
  # a {MagicLink} or if they are an editor.
  def readable_by?(reader)
    resource.published ||
      !reader.enrollment_for_case(resource).nil? ||
      reader.can_create?(Case)
  end
end
