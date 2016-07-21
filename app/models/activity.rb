class Activity < ApplicationRecord
  belongs_to :case
  acts_as_list scope: :case

  translates :title, :description, :pdf_url
end
