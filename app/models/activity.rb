class Activity < ApplicationRecord
  include Authority::Abilities

  belongs_to :case
  has_one :card, as: :element, dependent: :destroy

  include Element

  translates :title, :description, :pdf_url

  after_create_commit -> { create_card }
end
