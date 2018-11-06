# frozen_string_literal: true

# Catalog is Gala’s root path
class CatalogController < ApplicationController
  include SelectionParams

  decorates_assigned :cases

  # @route [GET] `/`
  def home
    @cases = policy_scope(Case)
             .ordered

    render layout: 'with_header'
  end
end
