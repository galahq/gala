class Card < ApplicationRecord
  before_save :set_solidity_from_contents
  before_save :set_case_from_element

  include Authority::Abilities

  belongs_to :case

  has_many :comment_threads, -> { order(:block_index, :start) }
  belongs_to :element, polymorphic: true
  acts_as_list scope: [:element_id, :element_type]

  translates :content, :raw_content

  include Trackable
  def event_name
    'read_card'
  end

  def event_properties
    { card_id: id }
  end

  def set_case_from_element
    self.case = element.case if element_id
  end

  def set_solidity_from_contents
    self.solid = !content_is_title?(content)
    true
  end

  UNSOLID_ROOT_TAGS = %w(h1 h2 h3 h4 h5 h6)
  def content_is_title? c
    html_fragment = Nokogiri::HTML::DocumentFragment.parse c
    html_fragment.children.count == 1 && html_fragment.children.first.name.in?(UNSOLID_ROOT_TAGS)
  end

end
