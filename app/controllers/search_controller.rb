# frozen_string_literal: true

class SearchController < ApplicationController
  # GET /search.json
  def index
    @cases = Case.all
                 .ordered
                 .merge(libraries_query)
                 .merge(full_text_query)
                 .pluck(:slug)
    render json: @cases
  end

  private

  def libraries_query
    return Case.all unless params[:libraries]

    Case.joins('LEFT JOIN libraries ON libraries.id = cases.library_id')
        .where(libraries[:slug].in(params[:libraries])
                                .or(maybe_shared_library))
        .ordered
  end

  def maybe_shared_library
    if params[:libraries].include? SharedCasesLibrary.instance.slug
      cases[:library_id].eq(nil)
    else
      cases[:id].eq(-1)
    end
  end

  def full_text_query
    return Case.all unless params[:q]

    query = params[:q].is_a?(Array) ? params[:q].join(' ') : params[:q]
    Case.joins('JOIN cases_search_index_en ON cases_search_index_en.id = cases.id')
        .where('cases_search_index_en.document @@ plainto_tsquery(?)', query)
        .reorder(
          'ts_rank(' \
             'cases_search_index_en.document, ' \
             "plainto_tsquery(#{ActiveRecord::Base.connection.quote(query)})" \
           ') DESC'
        )
  end

  def cases
    Case.arel_table
  end

  def libraries
    Library.arel_table
  end
end
