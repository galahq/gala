# frozen_string_literal: true

# Clone a case in preparation for translating it
class CaseCloneJob < ApplicationJob
  queue_as :default

  def perform(kase, locale:, cloner: CaseCloner)
    ActiveRecord::Base.transaction do
      cloner.call(kase, locale: locale)
    end
  end
end
