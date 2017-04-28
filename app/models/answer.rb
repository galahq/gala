class Answer < ApplicationRecord
  belongs_to :question
  belongs_to :quiz
  belongs_to :reader

  validates :content, presence: true

  scope :by_reader, -> (reader) { where reader: reader }

  before_save :cache_correctness

  def self.create_all answers, rest
    all = []

    begin
      transaction do
        answers.each do |answer|
          all << Answer.create!(answer.merge rest)
        end
      end
    rescue ActiveRecord::RecordInvalid
      return false
    end
    all
  end

  private
  def cache_correctness
    correct_answer = question.correct_answer
    self.correct = content == correct_answer if correct_answer
  end
end
