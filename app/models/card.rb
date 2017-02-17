class Card < ApplicationRecord
  before_save :set_solidity_from_contents

  include Authority::Abilities

  has_many :comment_threads, -> { order(:block_index, :start) }
  belongs_to :page
  acts_as_list scope: :page

  translates :content, :raw_content

  include Trackable
  def event_name
    'read_card'
  end

  def event_properties
    { card_id: id }
  end

  def case
    page.case
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
