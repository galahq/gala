class Deployment < ApplicationRecord
  belongs_to :case
  belongs_to :group
  belongs_to :quiz

  def needs_pretest
    true  # TODO: from database
  end
end
