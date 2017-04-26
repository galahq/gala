class Quiz < ApplicationRecord
  has_many :deployments, dependent: :nullify
  has_many :questions, dependent: :destroy
  has_many :answers, through: :questions
  belongs_to :case
  belongs_to :template, class_name: "Quiz"

  def self.requiring_response_from reader
    where(id: reader.deployments.select(:quiz_id))
      .where(id: Question.requiring_response_from(reader).select(:quiz_id))
  end

  def requires_response_from? reader
    questions.requiring_response_from(reader).any?
  end

end
