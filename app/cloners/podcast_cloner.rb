# frozen_string_literal: true

# @see Podcast
class PodcastCloner < ElementCloner
  # include_associations :artwork, :audio
  include_association :card, params: true
end
