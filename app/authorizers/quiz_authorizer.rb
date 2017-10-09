# frozen_string_literal: true

class QuizAuthorizer < ApplicationAuthorizer
  def readable_by?(reader)
    deployment = resource.deployments.find_by group: reader.groups
    !deployment.reader_needs_posttest?(reader)
  end
end
