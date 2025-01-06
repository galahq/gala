# frozen_string_literal: true

# Clone a case in preparation for translating it
class CaseCloneJob < ApplicationJob
  def perform(kase, locale:, cloner: CaseCloner)
    ActiveRecord::Base.transaction do
      operation = cloner.call(kase, **{ locale: locale })
      #operation.persist!
      #clone = operation.to_record
      #puts "Clone persisted: #{clone.persisted?}"
    end
  end
end
