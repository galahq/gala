# frozen_string_literal: true

class SearchController < ApplicationController
  # GET /search.json
  def index
    @cases = FindCases.by(params).pluck(:slug)
    render json: @cases
  end
end
