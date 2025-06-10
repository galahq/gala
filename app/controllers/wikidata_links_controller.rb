# frozen_string_literal: true

# @see Wikidatalink
class WikidataLinksController < ApplicationController
  include BroadcastEdits
  include VerifyLock

  before_action :authenticate_reader!
  before_action :set_case
  before_action -> { verify_lock_on @case }

  broadcast_edits to: :@case, type: :update

  # @route [POST] `/cases/case-slug/wikidata_links`
  def create
    authorize @case, :update?
    link_params = wikidata_links_params
    wikidata_link = @case.wikidata_links.find_or_initialize_by(
      schema: link_params[:schema], qid: link_params[:qid])

    wikidata_link.assign_attributes(link_params.merge(record_type: 'Case', record_id: @case.id))
    wikidata_link.fetch_and_update_data!

    if wikidata_link.save
      render json: wikidata_link,
             status: wikidata_link.new_record? ? :created : :ok
    else
      render json: { errors: wikidata_link.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/cases/case-slug/wikidata_links/id`
  def destroy
    authorize @case, :update?
    wikidata_link = @case.wikidata_links.find_by id: params[:id]
    wikidata_link&.destroy
    head :no_content
  end

  private

  def wikidata_links_params
    params.require(:wikidata_link).permit(:qid, :position, :schema)
  end

  def set_case
    @case = Case.friendly.find params[:case_slug]
  end
end
