# frozen_string_literal: true

# @see Quiz
class QuizAuthorizer < ApplicationAuthorizer
  # Readers can only see the answers for quizzes after they have submitted their
  # post-quiz
  def readable_by?(reader)
    deployment = resource.deployments.find_by group: reader.groups
    !deployment.reader_needs_posttest?(reader)
  end
end
