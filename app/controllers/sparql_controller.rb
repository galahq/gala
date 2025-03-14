# frozen_string_literal: true

# @see Wikidata
class SparqlController < ApplicationController
  # @route [GET] `/sparql/:schema/:qid`
  def show
    client = Wikidata::Client.new(I18n.locale)
    result = client.fetch(params[:schema], params[:qid])
    head :not_found and return if result.nil?
    render json: result
  end

  # @route [GET] `/sparql?query
  def index
    client = Wikidata::Client.new(I18n.locale)
    result = client.search(params[:query])
    head :not_found and return if result.nil?
    render json: result
  end
end
