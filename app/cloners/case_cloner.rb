# frozen_string_literal: true

# @see Case
class CaseCloner < Clowne::Cloner
  include_association :editorships

  nullify :published_at

  finalize do |source, record, params|
    locale = params.fetch(:locale)
    slug = params.fetch(:slug, SecureRandom.uuid)

    record.locale = locale
    record.slug = slug

    if source.locale == record.locale
      record.title = "COPY: #{record.title}"
      record.translation_base_id = nil
    else
      record.title = "#{Translation.language_name(locale)}: #{record.title}"
      record.translators = ['—']
    end

    if source.cover_image.attached? && source.cover_image.blob
      record.cover_image.attach(source.cover_image.blob)
    end
    if source.teaching_guide.attached? && source.teaching_guide.blob
      record.teaching_guide.attach(source.teaching_guide.blob)
    end

    record.save validate: false

    source.case_elements.each do |case_element|
      element = case_element.element
      element.class.cloner_class.call(element, kase: record)
    end
  end
end
