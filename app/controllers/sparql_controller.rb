# frozen_string_literal: true

class SparqlController < ApplicationController
  def show
    qid = params[:qid]
    Rails.logger.info "SparqlController show method invoked with QID: #{qid}"
    wikidata = Wikidata.new
    result = wikidata.call(qid)
    render json: result
  end
end
