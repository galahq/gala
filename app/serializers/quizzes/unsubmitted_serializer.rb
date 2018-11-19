# frozen_string_literal: true

module Quizzes
  # Serialize a quiz without the answers for learners who need to take it
  class UnsubmittedSerializer < ApplicationSerializer
    # Don’t send the correct answers with the questions, duh
    class QuestionSerializer < ApplicationSerializer
      attributes :id, :content, :options
    end

    attributes :id
    has_many :questions
  end
end
