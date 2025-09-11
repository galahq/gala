# frozen_string_literal: true

module Catalog
  # Index the languages that should be displayed in the catalog
  class LanguagesController < ApplicationController
    # @route [GET] `/catalog/languages`
    def index
      # Get languages that actually have cases
      languages_with_cases = Case.published
                                 .joins(:translation_base)
                                 .reorder(nil)  # Remove any existing ordering
                                 .distinct
                                 .pluck(:locale)
                                 .compact
                                 .sort

      # Map locale codes to language names using the Translation module
      @languages = languages_with_cases.map do |locale|
        {
          code: locale,
          name: Translation::AVAILABLE_LANGUAGES[locale.to_sym] || locale.humanize
        }
      end

      render json: @languages
    end
  end
end
