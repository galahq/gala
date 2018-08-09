# frozen_string_literal: true

# @see TranslationsController
module TranslationsHelper
  def options_for_locale_select(kase)
    used_languages = kase.translation_set.pluck(:locale)
    unused_languages = Translation.languages - used_languages
    options = unused_languages
              .map { |l| [Translation.language_name(l), l] }
    options_for_select options
  end
end
