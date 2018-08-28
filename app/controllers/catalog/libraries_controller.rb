# frozen_string_literal: true

module Catalog
  # Index the libraries that should be displayed in the catalog
  class LibrariesController < ApplicationController
    # @route [GET] `/catalog/libraries`
    def index
      @libraries = policy_scope(Library).visible_in_catalog.ordered
      render json: @libraries.decorate
    end
  end
end
