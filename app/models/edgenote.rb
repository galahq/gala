class Edgenote < ApplicationRecord
  belongs_to :case

  translates :caption, :content
end
