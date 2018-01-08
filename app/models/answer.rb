# frozen_string_literal: true

# A reader’s answer to a single question of a single submission of a single
# quiz.
#
# @attr content [String]
# @attr correct [Boolean]
# @attr case_completion [Numeric] A value 0 ≤ n < 1 signifying the fraction of
#   the case the user engaged with for longer than 3 seconds before submitting
#   this answer
class Answer < ApplicationRecord
  belongs_to :question
  belongs_to :quiz
  belongs_to :reader
  belongs_to :submission

  validates :content, presence: true

  before_save :cache_correctness

  # @return [ActiveRecord::Relation<Answer>]
  def self.by_reader(reader)
    where reader: reader
  end

  private

  # In case the correct answer to the question is changed after this answer was
  # created, we store whether or not it was correct at the time of submission.
  def cache_correctness
    correct_answer = question.correct_answer
    self.correct = content == correct_answer if correct_answer
  end
end
