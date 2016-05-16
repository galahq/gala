class Activity < ApplicationRecord
  belongs_to :case

  translates :title, :instructions, :pdf_url
end
