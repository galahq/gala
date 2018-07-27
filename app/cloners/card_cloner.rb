# frozen_string_literal: true

# @see Card
class CardCloner < Clowne::Cloner
  finalize do |_source, record, kase:, **|
    record.case = kase
    record.content_state =
      ContentStateCloner.call record.content_state, kase: kase
    record.save!
  end
end
