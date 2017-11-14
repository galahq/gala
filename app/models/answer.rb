# frozen_string_literal: true

class Answer < ApplicationRecord
  belongs_to :question
  belongs_to :quiz
  belongs_to :reader
  belongs_to :submission

  validates :content, presence: true

  scope :by_reader, ->(reader) { where reader: reader }

  before_save :cache_correctness

  private

  def cache_correctness
    correct_answer = question.correct_answer
    self.correct = content == correct_answer if correct_answer
  end
end
