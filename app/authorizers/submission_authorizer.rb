# frozen_string_literal: true

# @see Submission
class SubmissionAuthorizer < ApplicationAuthorizer
  # Only instructors may see their students’ quiz responses in aggregate
  def self.readable_by?(reader, deployment: nil)
    if deployment
      deployment.updatable_by? reader
    else
      true
    end
  end
end
