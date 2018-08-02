# frozen_string_literal: true

# @see Card
class CardCloner < Clowne::Cloner
  finalize do |_source, record, kase:, **|
    Card.acts_as_list_no_update do
      record.case = kase
      record.content_state =
        ContentStateCloner.call record.content_state, kase: kase
      record.save!
    end
  end
end
