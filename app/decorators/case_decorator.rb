# frozen_string_literal: true

# @see Case
class CaseDecorator < ApplicationDecorator
  decorates_association :case_elements
  decorates_association :edgenotes
  decorates_association :podcasts
  decorates_association :library

  def elements
    case_elements.map(&:element)
  end

  def short_title
    kicker.tap { |k| return 'Untitled Case' unless k.present? }
  end

  def cover_url(options = { width: 1280, height: 540 })
    ImageDecorator.decorate(cover_image).resized_path(**options)
  end

  def small_cover_url
    cover_url width: 200, height: 200, sharpen: 1.0
  end

  def open_graph_cover_url
    "#{ENV['BASE_URL']}#{cover_url width: 1200, height: 1200}"
    #ImageDecorator.decorate(cover_image).resized_url({ width: 1200, height: 1200 })
  end

  # cover_image as a File for attachment to an email
  def cover_image_attachment
    ImageDecorator.decorate(cover_image).resized_file width: 470, height: 95
  end

  def teaching_guide_url
    return nil unless teaching_guide.attached?

    polymorphic_path teaching_guide, only_path: true
  end

  def other_available_locales(for_reader:)
    translations.each_with_object({}) do |kase, table|
      next unless Pundit.policy(for_reader, kase).show?

      table[kase.locale] = {
        link: polymorphic_path(kase, only_path: true),
        name: Translation.language_name(kase.locale)
      }
    end
  end
end
