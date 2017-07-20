# frozen_string_literal: true

# Mock public API in GenericDeployment
class Deployment < ApplicationRecord
  include Authority::Abilities

  belongs_to :case
  belongs_to :group
  belongs_to :quiz

  validates :quiz, presence: true, if: -> { answers_needed.positive? }

  def pretest_assigned?
    answers_needed >= 2
  end

  def reader_needs_pretest?(reader)
    return false if reader.enrollment_for_case(self.case).instructor?
    answers_needed - quiz.number_of_responses_from(reader) >= 2
  end

  def posttest_assigned?
    answers_needed >= 1
  end

  def reader_needs_posttest?(reader)
    return false unless quiz
    answers_needed - quiz.number_of_responses_from(reader) >= 1
  end
end
