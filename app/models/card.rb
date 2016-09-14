class Card < ApplicationRecord
  belongs_to :page
  acts_as_list scope: :page

  translates :content
end
