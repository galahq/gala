# frozen_string_literal: true

# An audio component of a case. It can have one associated card as a description
#
# @attr title [String]
# @attr credits [CreditsList] the hosts and guests on the episode
# @attr photo_credit [String] attribution for the {artwork_url}’s rights holder
class Podcast < ApplicationRecord
  include Element
  include Lockable
  include Trackable

  # @!method card
  #   @api private
  #   Prefer {cards}
  has_one :card, as: :element, dependent: :destroy, required: true

  has_one_attached :artwork
  has_one_attached :audio

  before_validation :build_card, on: :create, unless: -> { card.present? }

  validates :artwork, content_type: { in: %w[image/png image/jpeg],
                                      message: 'must be JPEG or PNG' }

  def cards
    [card]
  end

  def credits_list=(credits_list)
    self.credits = if credits_list.is_a?(CreditsList)
                     credits_list.attributes.to_yaml
                   else
                     credits_list.to_yaml
                   end
  end

  def credits_list
    if credits
      raw_credits = YAML.safe_load(credits,
                                   permitted_classes: [
                                     Symbol,
                                     ActiveSupport::HashWithIndifferentAccess
                                   ])
      CreditsList.new(raw_credits)
    else
      CreditsList.new
    end
  end

  def event_name
    'visit_podcast'
  end

  def event_properties
    { podcast_id: id }
  end
end
