class Card < ApplicationRecord
  include Authority::Abilities

  belongs_to :case

  has_many :comment_threads, -> { order(:block_index, :start) }
  belongs_to :element, polymorphic: true
  acts_as_list scope: [:element_id, :element_type]

  translates :content, :raw_content

  before_save :set_case_from_element

  def paragraphs
    JSON.parse(raw_content)["blocks"].map{ |x| x["text"] }
  end

  include Trackable
  def event_name
    'read_card'
  end

  def event_properties
    { card_id: id }
  end

  private
  def set_case_from_element
    self.case = element.case if element
  end
end
