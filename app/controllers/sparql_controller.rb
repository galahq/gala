# frozen_string_literal: true

class SparqlController < ApplicationController
  def show
    schema = params[:schema]
    qid = params[:qid]
    Rails.logger.info "SparqlController show method invoked with schema: #{schema}, QID: #{qid}"
    wikidata = Wikidata.new(schema, qid)
    result = wikidata.call
    head :not_found and return if result.nil?
    render json: result
  end
end
