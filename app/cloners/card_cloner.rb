# frozen_string_literal: true

# @see Card
class CardCloner < Clowne::Cloner
  finalize do |_source, record, params|
    kase = params.fetch(:kase)

    Card.acts_as_list_no_update do
      record.case = kase
      clone = ContentStateCloner.call(_source.raw_content, kase: kase)
      record.raw_content = clone
      record.save validate: false
    end
  end
end
