# frozen_string_literal: true

module Catalog
  # Index the languages that should be displayed in the catalog
  class LanguagesController < ApplicationController
    include PublicCatalogCache

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

      if anonymous_json_catalog_request?
        render render_public_catalog_json(
          ['catalog-languages', I18n.locale.to_s, catalog_cache_timestamp(Case)],
          json: @languages
        )
        return
      end

      render json: @languages
    end
  end
end
