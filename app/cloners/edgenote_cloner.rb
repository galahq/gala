# frozen_string_literal: true

# @see Edgenote
class EdgenoteCloner < Clowne::Cloner
  include_attached :audio, :image
  include_associations :link_expansion_visibility

  nullify :slug

  finalize do |_source, record, kase:, **|
    record.case = kase
    record.save!
  end
end
