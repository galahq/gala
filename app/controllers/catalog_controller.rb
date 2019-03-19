# frozen_string_literal: true

# Catalog is Gala’s root path
class CatalogController < ApplicationController
  include SelectionParams

  decorates_assigned :cases

  layout 'with_header'

  # @route [GET] `/`
  def home
    @cases = policy_scope(Case)
             .ordered
  end
end
