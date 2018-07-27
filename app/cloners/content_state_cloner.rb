# frozen_string_literal: true

# @see ContentState
class ContentStateCloner < Clowne::Cloner
  finalize do |_source, record, kase:, **|
    unless record.entity_map.blank?
      record.entity_map.transform_values! do |entity|
        next entity unless entity[:type] == 'EDGENOTE'

        edgenote = Edgenote.friendly.find entity[:data][:slug]
        edgenote_clone = EdgenoteCloner.call edgenote, kase: kase

        entity[:data][:slug] = edgenote_clone.slug
        entity
      end
    end
  end
end
