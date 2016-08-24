class Edgenote < ApplicationRecord
  belongs_to :case
  belongs_to :card

  translates :caption, :content, :instructions
end
