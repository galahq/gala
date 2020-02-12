# frozen_string_literal: true

# @see Edgenote
class EdgenoteCloner < Clowne::Cloner
  include_attached :audio, :image
  include_associations :link_expansion_visibility

  nullify :slug

  finalize do |_source, record, kase:, **|
    record.case = kase
    if _source.audio.attached? && _source.audio.blob
      record.audio.attach(_source.audio.blob)
    end
    if _source.file.attached? && _source.file.blob
      record.file.attach(_source.file.blob)
    end
    if _source.image.attached? && _source.image.blob
      record.image.attach(_source.image.blob)
    end
    record.save!
  end
end
