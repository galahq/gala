class Deployment < ApplicationRecord
  belongs_to :case
  belongs_to :group
  belongs_to :quiz
end
