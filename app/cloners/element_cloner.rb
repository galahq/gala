# frozen_string_literal: true

# A cloner for an object playing the role of Element needs to create a
# CaseElement to relate it to its case.
class ElementCloner < Clowne::Cloner
  finalize do |source, record, kase:, **|
    Card.acts_as_list_no_update do
      record.build_case_element case: kase
      record.cards.each { |card| card.element = record }

      if record.class == Podcast
        if source.artwork.attached? && source.artwork.blob
          record.artwork.attach(source.artwork.blob)
        end
        if source.audio.attached? && source.audio.blob
          record.audio.attach(source.audio.blob)
        end
      end

      record.save!
    end
  end
end
