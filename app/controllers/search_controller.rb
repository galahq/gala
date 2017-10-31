# frozen_string_literal: true

class SearchController < ApplicationController
  def index
    @cases = Case.all
                 .merge(libraries_query)
                 .merge(full_text_query)
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
        .ordered
  end

  def full_text_query
    return Case.all unless params[:q]

    Case.joins('JOIN cases_search_index_en ON cases_search_index_en.id = cases.id')
        .where('cases_search_index_en.document @@ plainto_tsquery(:q)', q: params[:q])
        .reorder(
          "ts_rank(
             cases_search_index_en.document,
             plainto_tsquery(#{ActiveRecord::Base.connection.quote(params[:q])})
           ) DESC"
        )
  end
end
