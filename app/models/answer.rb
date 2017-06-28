class Answer < ApplicationRecord
  belongs_to :question
  belongs_to :quiz
  belongs_to :reader

  validates :content, presence: true

  scope :by_reader, ->(reader) { where reader: reader }

  before_save :cache_correctness

  def self.create_all(answers, quiz:, reader:)
    completion = reader.enrollment_for_case(quiz.case).case_completion
    answer_params = { quiz: quiz, reader: reader, case_completion: completion }

    all = []
    begin
      transaction do
        answers.each do |answer|
          all << Answer.create!(answer.merge(answer_params))
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
