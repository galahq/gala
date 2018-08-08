# frozen_string_literal: true

# A card of text. It represents a discrete quantum of narrative. {Podcast} and
# {Activity} elements have one; many can appear on each {Page}. Cards on pages
# can have {Edgenote}s attached, which are referenced by slug in the card’s
# {raw_content} as `DraftEntity`s.
#
# @attr position [Numeric] this card’s sequence within its {Page} (other
#   {Element}s can only have one)
# @attr solid [Boolean] whether the card should have a white background or not
# @attr raw_content [RawDraftContentState] the card’s content, to be
#   used with Draft.js in React
class Card < ApplicationRecord
  include Lockable
  include Trackable

  # composed_of :content_state, class_name: 'ContentState',
  #                             mapping: %w[raw_content raw_content]

  belongs_to :case
  belongs_to :element, polymorphic: true, touch: true

  has_many :comment_threads, -> { order(:block_index, :start) },
           dependent: :destroy

  before_validation :set_case_from_element

  acts_as_list scope: %i[element_id element_type]

  delegate :paragraphs, to: :content_state

  def content_state
    ContentState.new raw_content
  end

  def content_state=(content_state)
    self.raw_content = content_state.raw_content
  end

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

  private

  # Since elements are polymorphic, it’s way easier to eagerly load cards when
  # loading a case if we have a direct association. It does mean we have to keep
  # it updated, so this runs before save.
  def set_case_from_element
    self.case = element.case if element
  end
end
