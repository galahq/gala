# frozen_string_literal: true

class WikidataLinksController < ApplicationController
  # include BroadcastEdits
  # include VerifyLock

  before_action :set_case
  # before_action :set_cors_headers, only: %i[show]

  # broadcast_edits to: :@wikidata_link

  # decorates_assigned :wikidata_link

  # @route [POST] `/cases/:case_slug/wikidata_links`
  def sync
    authorize @case, :update?

    existing_ids = @case.wikidata_links.pluck(:id)
    incoming_ids = params[:wikidata_links].map { |link| link[:id] }.compact

    # Delete WikidataLinks not in the incoming array
    @case.wikidata_links.where.not(id: incoming_ids).destroy_all

    params[:wikidata_links].each_with_index do |link_params, index|
      link_params[:position] = index
      if link_params[:id].present?
        # Update existing WikidataLink
        wikidata_link = @case.wikidata_links.find(link_params[:id])
        wikidata_link.update(link_params.permit(:object_type, :object_id, :schema, :qid, :position))
      else
        # Create new WikidataLink
        @case.wikidata_links.create(link_params.permit(:object_type, :object_id, :schema, :qid, :position))
      end
    end

    render json: @case.wikidata_links
  end

  private

  def set_case
    @case = Case.find_by(slug: params[:case_slug])
  end

  def wikidata_link_params
    params.require(:wikidata_links).map do |link|
      link.permit(:id, :object_type, :object_id, :schema, :qid, :position)
    end
  end

  def set_cors_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, PUT, DELETE, GET, OPTIONS'
    headers['Access-Control-Request-Method'] = '*'
    headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  end
end
