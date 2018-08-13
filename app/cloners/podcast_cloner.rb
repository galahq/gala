# frozen_string_literal: true

# @see Podcast
class PodcastCloner < ElementCloner
  include_attached :artwork, :audio
  include_association :card, params: true
end
