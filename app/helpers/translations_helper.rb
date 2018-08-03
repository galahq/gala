# frozen_string_literal: true

# @see TranslationsController
module TranslationsHelper
  def options_for_locale_select(kase)
    used_locales = kase.translation_set.pluck(:locale).map(&:to_sym)
    unused_locales = I18n.available_locales - used_locales
    options = unused_locales
              .map { |l| [I18n.t("support.languages.#{l}"), l] }
              .sort_by(&:first)
    options_for_select options
  end
end
