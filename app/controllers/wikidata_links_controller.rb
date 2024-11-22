# frozen_string_literal: true

# @see Wikilink
class WikilinksController < ApplicationController
  include BroadcastEdits
  include VerifyLock

  before_action :authenticate_reader!
  before_action :set_case
  before_action -> { verify_lock_on @case }

  broadcast_edits to: :@case, type: :update

  # @route [POST] `/cases/case-slug/wikidata_links`
  def create
    wikidata_link = @case.wikidata_links.create params[:wikidata_link]
    render json: wikidata_link, status: :created
  end

  # @route [DELETE] `/cases/case-slug/wikidata_links/id`
  def destroy
    wikidata_link = @case.wikidata_links.find params[:id]
    wikidata_link.destroy
    head :no_content
  end

  private

  def set_case
    @case = Case.friendly.find params[:case_slug]
  end
end
