class Deployment < ApplicationRecord
  belongs_to :case
  belongs_to :group
  belongs_to :quiz

  def needs_pretest?
    answers_needed > 1
  end
end
