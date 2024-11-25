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
    create_or_update
  end

  def create_or_update
    Rails.logger.info params.inspect
    Rails.logger.info wikidata_links_params.inspect

    # Check for an existing link by schema and QID
    existing_link = @case.wikidata_links.find_by(
      schema: wikidata_links_params[:schema],
      qid: wikidata_links_params[:qid]
    )

    if existing_link
      # Update the existing link if found
      Rails.logger.info "Updating existing Wikidata link: #{existing_link.id}"
      if existing_link.update(wikidata_links_params)
        render json: existing_link, status: :ok
      else
        Rails.logger.error "Failed to update Wikidata link: #{existing_link.errors.full_messages}"
        render json: { errors: existing_link.errors.full_messages }, status: :unprocessable_entity
      end
    else
      # Create a new link if it doesn't exist
      Rails.logger.info "Creating new Wikidata link"
      wikidata_link = @case.wikidata_links.build(
        wikidata_links_params.merge(object_type: 'Case', object_id: @case.id)
      )

      if wikidata_link.save
        Rails.logger.info "Created Wikidata link: #{wikidata_link.id}"
        render json: wikidata_link, status: :created
      else
        Rails.logger.error "Failed to create Wikidata link: #{wikidata_link.errors.full_messages}"
        render json: { errors: wikidata_link.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end

  # @route [DELETE] `/cases/case-slug/wikidata_links/id`
  def destroy
    wikidata_link = @case.wikidata_links.find_by qid: params[:id]
    Rails.logger.info "Destroying Wikidata link: #{wikidata_link.id}"
    Rails.logger.info "Wikidata link: #{wikidata_link.inspect}"
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
