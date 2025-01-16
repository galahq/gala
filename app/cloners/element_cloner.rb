# frozen_string_literal: true

# A cloner for an object playing the role of Element needs to create a
# CaseElement to relate it to its case.
class ElementCloner < Clowne::Cloner
  finalize do |_source, record, params|
    kase = params.fetch(:kase)

    Card.acts_as_list_no_update do
      record.build_case_element case: kase
      record.cards.each { |card| card.element = record }
      record.save validate: false
    end
  end
end
