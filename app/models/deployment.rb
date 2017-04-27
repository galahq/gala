# Mock public API in GenericDeployment
class Deployment < ApplicationRecord
  belongs_to :case
  belongs_to :group
  belongs_to :quiz

  def needs_pretest?
    answers_needed > 1
  end

  def reader_needs_pretest? reader
    answers_needed - quiz.number_of_responses_from(reader) > 1
  end
end
