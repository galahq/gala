# frozen_string_literal: true

# @see Wikidata
class SparqlController < ApplicationController
  # @route [GET] `/sparql/:schema/:qid`
  def show
    schema = params[:schema]&.to_sym
    qid = params[:qid]

    head :bad_request and return unless schema && qid
    head :bad_request and return unless Wikidata::QueryBuilder::PROPERTY_ORDER.key?(schema)

    result = Wikidata.query_entity(schema, qid)
    head :not_found and return if result.nil?

    render json: result
  end

  # @route [GET] `/sparql?query=:query`
  def index
    query = params[:query]
    head :bad_request and return unless query.present?

    result = Wikidata.search(query)
    head :not_found and return if result.nil?

    render json: result
  end
end
