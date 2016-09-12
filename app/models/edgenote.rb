class Edgenote < ApplicationRecord
  belongs_to :case
  belongs_to :card

  translates :caption, :content, :instructions, :image_url, :website_url, :embed_code, :photo_credit, :pdf_url
end
