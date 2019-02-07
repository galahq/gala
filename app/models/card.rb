# frozen_string_literal: true

# A card of text. It represents a discrete quantum of narrative. {Podcast}
# elements have one; many can appear on each {Page}. Cards on pages can have
# {Edgenote}s attached, which are referenced by slug in the card’s {raw_content}
# as `DraftEntity`s.
#
# @attr position [Numeric] this card’s sequence within its {Page} (other
#   {Element}s can only have one)
# @attr solid [Boolean] whether the card should have a white background or not
# @attr raw_content [RawDraftContentState] the card’s content, to be
#   used with Draft.js in React
class Card < ApplicationRecord
  include Lockable
  include Trackable

  attribute :raw_content, ContentState::Type.new

  belongs_to :case
  belongs_to :element, polymorphic: true, touch: true

  has_many :comment_threads, dependent: :destroy

  before_validation :set_case_from_element

  acts_as_list scope: %i[element_id element_type]

  delegate :case_element, to: :element
  delegate :paragraphs, to: :raw_content

  # @return [Numeric, nil]
  def page_id
    element_type == 'Page' ? element_id : nil
  end

  # The name of the corresponding {Ahoy::Event}s
  # @see Trackable#event_name
  def event_name
    'read_card'
  end

  # The filter parameters used to find the corresponding {Ahoy::Event}s
  # @see Trackable#event_properties
  def event_properties
    { card_id: id }
  end

  # Could this card’s element have other cards too?
  def siblings?
    element_type.constantize.reflect_on_association(:cards)
  end

  # Add an Edgenote to the Card
  # @param edgenote [Edgenote]
  # @param range [ContentState::Range]
  def add_edgenote(edgenote, range:)
    return false if edgenote.case.present? && edgenote.case != self.case
    edgenote.update case: self.case unless edgenote.case.present?
    raw_content.add_edgenote edgenote, range: range
  end

  private

  # Since elements are polymorphic, it’s way easier to eagerly load cards when
  # loading a case if we have a direct association. It does mean we have to keep
  # it updated, so this runs before save.
  def set_case_from_element
    self.case = element.case if element
  end
end
