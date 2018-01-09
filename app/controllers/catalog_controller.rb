# frozen_string_literal: true

# Catalog is Gala’s root path
class CatalogController < ApplicationController
  # @route [GET] `/`
  def home
    render layout: 'with_header'
  end
end
