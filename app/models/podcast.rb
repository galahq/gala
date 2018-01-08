# frozen_string_literal: true

# An audio component of a case. It can have one associated card as a description
#
# @attr title [Translated<String>]
# @attr audio_url [Translated<String>]
# @attr credits [Translated<CreditsList>] the hosts and guests on the episode
# @attr artwork_url [String] a cover image for the podcast
# @attr photo_credit [String] attribution for the {artwork_url}’s rights holder
class Podcast < ApplicationRecord
  include Authority::Abilities
  include Element
  include Mobility
  include Trackable

  translates :title, :audio_url, :description, :credits, fallbacks: true

  belongs_to :case, touch: true
  has_one :card, as: :element, dependent: :destroy

  after_create_commit -> { create_card }

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
      CreditsList.new(YAML.load(credits))
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
