# frozen_string_literal: true

# @see Quiz
class QuizSerializer < ApplicationSerializer
  attributes :id, :title
  has_many :questions
end
