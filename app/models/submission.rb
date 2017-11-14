# frozen_string_literal: true

class Submission < ApplicationRecord
  include Authority::Abilities

  belongs_to :quiz
  belongs_to :reader
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

  def answer(to_question_id:)
    answers.find { |a| a.question_id == to_question_id }.try(:content) || ''
  end
end
