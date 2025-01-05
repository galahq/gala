# frozen_string_literal: true

# @see Edgenote
class EdgenoteCloner < Clowne::Cloner
  include_associations :link_expansion_visibility
  nullify :slug

  finalize do |source, record, params:|
    record.case = params[:kase]
    if source.audio.attached? && source.audio.blob
      record.audio.attach(source.audio.blob)
    end
    if source.file.attached? && source.file.blob
      record.file.attach(source.file.blob)
    end
    if source.image.attached? && source.image.blob
      record.image.attach(source.image.blob)
    end
    record.save validate: false
  end
end
