# frozen_string_literal: true

# A set of {Answer}s for a {Quiz}’s {Question}s.
class Submission < ApplicationRecord
  Score = Struct.new(:correct, :total) do
    def to_s
      "#{correct}/#{total}"
    end
  end

  belongs_to :quiz
  belongs_to :reader

  has_one :case, through: :quiz

  has_many :answers, dependent: :destroy

  def self.create(answers:, quiz:, reader:)
    completion = reader.enrollment_for_case(quiz.case).case_completion
    answer_params = { quiz: quiz, reader: reader, case_completion: completion }

    begin
      transaction do
        submission = create! quiz: quiz, reader: reader
        answers.each do |answer|
          submission.answers.create! answer.merge(answer_params)
        end
        submission
      end
    rescue ActiveRecord::RecordInvalid
      return false
    end
  end

  def score
    Score.new autogradable_answers.count(&:correct),
              autogradable_answers.count
  end

  def autogradable_answers
    answers.includes(:question).reject { |a| a.question.options.blank? }
  end

  # @return [String]
  def answer(to_question_id:)
    answers.find { |a| a.question_id == to_question_id }.try(:content) || ''
  end

  def case_completion
    answers.first&.case_completion
  end
end
