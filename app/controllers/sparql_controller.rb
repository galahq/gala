# frozen_string_literal: true

# @see Wikidata
class SparqlController < ApplicationController
  # @route [GET] `/sparql/:schema/:qid`
  def show
    wikidata = Wikidata.new current_reader.locale
    result = wikidata.canned_query params[:schema], params[:qid]
    head :not_found and return if result.nil?
    render json: result
  end

  # @route [GET] `/sparql?query
  def index
    wikidata = Wikidata.new current_reader.locale
    result = wikidata.search params[:query]
    head :not_found and return if result.nil?
    render json: result
  end
end
