# frozen_string_literal: true

# @see Podcast
class PodcastSerializer < ApplicationSerializer
  attributes :id, :position, :title, :audio_url, :artwork_url, :photo_credit
  attribute(:url) { podcast_path I18n.locale, object }
  attribute(:credits_list) { object.credits_list.to_sentence }
  attribute(:card_id) { object.card.id }
  attribute(:icon_slug) { 'toc-podcast' }

  belongs_to :case_element
end
