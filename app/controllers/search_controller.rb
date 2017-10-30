# frozen_string_literal: true

class SearchController < ApplicationController
  def index
    @cases = Case.all
                 .merge(libraries_query)
                 .ordered
                 .pluck(:slug)
    render json: @cases
  end

  private

  def libraries_query
    return Case.all unless params[:libraries]

    Case.where(
      <<~SQL,
        cases.library_id IN (
          SELECT id FROM libraries
          WHERE libraries.slug IN (:libraries)
        )
      SQL
      libraries: params[:libraries]
    )
  end
end
