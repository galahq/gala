# frozen_string_literal: true

# @see Wikidata
class SparqlController < ApplicationController
  # @route [GET] `/sparql/:schema/:qid`
  def show
    wikidata = Wikidata.new params[:schema], params[:qid]
    result = wikidata.call
    head :not_found and return if result.nil?
    render json: result
  end
end
