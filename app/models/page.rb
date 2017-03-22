class Page < ApplicationRecord
  include Authority::Abilities

  belongs_to :case
  has_one :case_element, as: :element, dependent: :destroy

  has_many :cards, -> { order position: :asc }, as: :element, dependent: :destroy
  translates :title

  include Trackable
  def event_name
    'visit_page'
  end

  def event_properties
    {case_slug: this.case.slug, page_position: position}
  end
end
