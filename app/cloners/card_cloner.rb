# frozen_string_literal: true

# @see Card
class CardCloner < Clowne::Cloner
  finalize do |source, record, **params|
    Card.acts_as_list_no_update do
      record.case = params[:kase]
      clone = ContentStateCloner.call(source.raw_content, kase: params[:kase])
      record.raw_content = clone
      record.save validate: false
    end
  end
end
