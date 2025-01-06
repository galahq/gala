# frozen_string_literal: true

# @see Podcast
class PodcastCloner < ElementCloner
  include_associations :card

  finalize do |source, record, **params|
    if source.artwork.attached? && source.artwork.blob
      record.artwork.attach(source.artwork.blob)
    end
    if source.audio.attached? && source.audio.blob
      record.audio.attach(source.audio.blob)
    end
    record.save validate: false
  end
end
