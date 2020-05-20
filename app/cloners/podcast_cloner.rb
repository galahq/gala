# frozen_string_literal: true

# @see Podcast
class PodcastCloner < ElementCloner
  include_attached :artwork, :audio
  include_association :card, params: true

  finalize do |source, record, kase:, **|
    if source.artwork.attached? && source.artwork.blob
      record.artwork.attach(source.artwork.blob)
    end
    if source.audio.attached? && source.audio.blob
      record.audio.attach(source.audio.blob)
    end
    record.save validate: false
  end
end
