class Answer < ApplicationRecord
  belongs_to :question
  belongs_to :quiz
  belongs_to :reader

  scope :by_reader, -> (reader) { where reader: reader }

  before_save :cache_correctness

  private
  def cache_correctness
    correct_answer = question.correct_answer
    self.correct = content == correct_answer if correct_answer
  end
end
