# frozen_string_literal: true

class Question < ApplicationRecord
  has_many :answers
  belongs_to :quiz

  include Mobility
  translates :content

  validates :content_i18n, presence: true
  validates :correct_answer, inclusion: { in: ->(question) { question.options } },
                             if: ->(question) { !question.options.empty? }

  def self.requiring_response_from(reader, in_group:)
    # where.not(id: Answer.by_reader(reader).select(:question_id))
    joins(:quiz).where <<~SQL, reader_id: reader.id, group_id: in_group.id
      (
        SELECT COUNT(answers.id)
          FROM answers
         WHERE answers.question_id = questions.id
           AND answers.reader_id = :reader_id
      ) < (
        SELECT deployments.answers_needed
          FROM deployments
         WHERE deployments.group_id = :group_id
           AND deployments.case_id = quizzes.case_id
      )
    SQL
  end

  def multiple_choice?
    question_type == :multiple_choice
  end

  def open_ended?
    question_type == :open_ended
  end

  private

  def question_type
    options.empty? ? :open_ended : :multiple_choice
  end
end
