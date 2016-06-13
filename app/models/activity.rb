class Activity < ApplicationRecord
  belongs_to :case

  translates :title, :description, :pdf_url
end
