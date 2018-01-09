# frozen_string_literal: true

# The case catalog is searchable.
# @see FindCases
class SearchController < ApplicationController
  # @route [GET] `/search.json`
  def index
    @cases = FindCases.by(params).pluck(:slug)
    render json: @cases
  end
end
