# frozen_string_literal: true

# The questions of a {Quiz}. They can be multiple choice, among {options}, or
# short answer, in which case {options} is empty.
#
# @attr content [Translated<String>] we do not expect the question content to be
#   translated, at this point. If this changes, {options} and {correct_answer}
#   will need to be translated as well
# @attr options [Array<String>] the selection of multiple choice answers, if any
# @attr correct_answer [String] this should exactly match one of options, unless
#   the question is a short answer
class Question < ApplicationRecord
  include Mobility

  translates :content, fallbacks: true

  has_many :answers
  belongs_to :quiz

  validates :content, presence: true
  validates :correct_answer, inclusion: { in: ->(q) { q.options } },
                             if: ->(q) { !q.options.empty? }

  scope :multiple_choice, -> { where Arel.sql 'cardinality(options) > 0' }
  scope :open_ended, -> { where Arel.sql 'cardinality(options) = 0' }

  # A relation of questions that the reader, in the context of her active group,
  # hasn’t answered enough times. Whether “enough” is 1 or 2 depends on the
  # instructor’s choice, per {Deployment}.
  # @return [ActiveRecord::Relation<Question>]
  def self.requiring_response_from(reader, in_group:)
    joins(:quiz).where(
      <<~SQL.squish,
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
      reader_id: reader.id,
      group_id: in_group.id
    )
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
