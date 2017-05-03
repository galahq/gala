class Quiz < ApplicationRecord
  has_many :deployments, dependent: :nullify
  has_many :questions, dependent: :destroy
  has_many :answers, through: :questions
  belongs_to :case
  belongs_to :template, class_name: "Quiz"

  scope :recommended, -> { where template: nil }

  def self.requiring_response_from reader
    where(id: reader.deployments.select(:quiz_id))
      .where(id: Question.requiring_response_from(reader).select(:quiz_id))
  end

  def requires_response_from? reader, in_group:
    questions.requiring_response_from(reader, in_group: in_group).any?
  end

  def number_of_responses_from reader
    answers.merge(reader.answers).group(:question_id).count(:question_id)
      .values.min || 0
  end

end
