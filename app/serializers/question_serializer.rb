# frozen_string_literal: true

# @see Question
class QuestionSerializer < ApplicationSerializer
  attributes :id, :content, :options, :correct_answer
end
