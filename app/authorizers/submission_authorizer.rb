# frozen_string_literal: true

class SubmissionAuthorizer < ApplicationAuthorizer
  def self.readable_by?(reader, deployment: nil)
    if deployment
      deployment.updatable_by? reader
    else
      true
    end
  end
end
