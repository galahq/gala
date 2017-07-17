# frozen_string_literal: true

class Podcast < ApplicationRecord
  include Authority::Abilities

  belongs_to :case, touch: true
  has_one :card, as: :element, dependent: :destroy

  include Element

  include Mobility
  translates :title, :audio_url, :description, :credits, fallbacks: true

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

  include Trackable
  def event_name
    'visit_podcast'
  end

  def event_properties
    { podcast_id: id }
  end
end
