# frozen_string_literal: true

# @see Quiz
class QuizSerializer < ApplicationSerializer
  # Don’t send the correct answers with the questions, duh
  class QuestionSerializer < ApplicationSerializer
    attributes :id, :content, :options
  end

  attributes :id
  has_many :questions
end
