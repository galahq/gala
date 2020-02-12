# frozen_string_literal: true

# @see Case
class CaseCloner < Clowne::Cloner
  include_attached :cover_image
  include_associations :editorships, :taggings

  nullify :published_at

  finalize do |source, record, locale:, slug: SecureRandom.uuid, **|
    Rails.logger.info "*************** CaseCloner.finalize ******************"
    record.locale = locale
    record.slug = slug
    record.title = "#{Translation.language_name(locale)}: #{record.title}"
    record.translators = ['—']

    record.save!
    Rails.logger.info "*************** CaseCloner.finalize RECORD SAVED ******************"

    source.case_elements.each do |case_element|
      element = case_element.element
      element.class.cloner_class.call(element, kase: record)
    end
    Rails.logger.info "*************** CaseCloner.finalize  ELEMENTS CLONED ******************"


  end
end
