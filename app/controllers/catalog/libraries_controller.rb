# frozen_string_literal: true

module Catalog
  # Index the libraries that should be displayed in the catalog
  class LibrariesController < ApplicationController
    include PublicCatalogCache

    # @route [GET] `/catalog/libraries`
    def index
      @libraries = policy_scope(Library).visible_in_catalog.ordered

      if anonymous_json_catalog_request?
        render_public_catalog_json(
          ['catalog-libraries', I18n.locale.to_s, catalog_cache_timestamp(Library)],
          json: @libraries.decorate
        )
        return
      end

      render json: @libraries.decorate
    end
  end
end
