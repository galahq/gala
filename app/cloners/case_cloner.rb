# frozen_string_literal: true

class CaseCloner < Clowne::Cloner
  include_associations :editorships
  nullify :published_at

  finalize do |source, record, params:|
    record.locale = params[:locale]
    record.slug = params[:slug] || SecureRandom.uuid
    if source.locale == record.locale
      record.title = "COPY: #{record.title}"
      record.translation_base_id = nil
    else
      record.title = "#{Translation.language_name(params[:locale])}: #{record.title}"
      record.translators = ['—']
    end

    if source.cover_image.attached?
      if source.cover_image.blob
        record.cover_image.attach(source.cover_image.blob)
      end
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

# @see Case
# class CaseCloner < Clowne::Cloner
#   adapter :active_record
#
#   include_attached :cover_image #, :teaching_guide
#   include_associations :editorships #, :taggings
#
#   exclude_association :deployments
#   exclude_association :enrollments
#   exclude_association :comments
#
#   nullify :published_at
#
#
#   finalize do |source, record, locale:, slug: SecureRandom.uuid, **|
#     record.locale = locale
#     record.slug = slug
#     if source.locale == record.locale
#       record.title = "COPY: #{record.title}"
#       record.kicker = "c-#{record.kicker}"
#     else
#       record.title = "#{Translation.language_name(locale)}: #{record.title}"
#       record.kicker = "#{Translation.language_name(locale)} #{record.kicker}"
#       record.translators = ['—']
#     end
#     #record.save validate: false
#     if source.cover_image.attached? && source.cover_image.blob
#       source.cover_image.open do |tempfile|
#         record.cover_image.attach({
#           io: File.open(tempfile.path),
#           filename: source.cover_image.blob.filename,
#           content_type: source.cover_image.blob.content_type
#         })
#       end
#     end
#     if source.teaching_guide.attached? && source.teaching_guide.blob
#       source.teaching_guide.open do |tempfile|
#         record.teaching_guide.attach({
#           io: File.open(tempfile.path),
#           filename: source.teaching_guide.blob.filename,
#           content_type: source.teaching_guide.blob.content_type
#         })
#       end
#     end
#     #record.save validate: false
#     source.case_elements.each do |case_element|
#       element = case_element.element
#       element.class.cloner_class.call(element, kase: record)
#     end
#
#   end
# end
