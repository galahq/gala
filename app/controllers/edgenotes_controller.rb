# frozen_string_literal: true

# @see Edgenote
class EdgenotesController < ApplicationController
  include BroadcastEdits
  include VerifyLock

  before_action :set_edgenote, only: %i[show update destroy]
  before_action :set_case, only: [:create]
  before_action :set_cors_headers, only: [:show]
  before_action -> { verify_lock_on @edgenote }, only: %i[update destroy]

  broadcast_edits to: :@edgenote

  decorates_assigned :edgenote

  # @route [POST] `/cases/case-slug/edgenotes`
  def create
    @edgenote = @case.edgenotes.build
    authorize @edgenote

    if @edgenote.save
      render json: edgenote
    else
      render json: @edgenote.errors, status: :unprocessable_entity
    end
  end

  # @route [PATCH/PUT] `/edgenotes/slug`
  def update
    authorize @edgenote

    if @edgenote.update(edgenote_params)
      render json: edgenote
    else
      render json: @edgenote.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/edgenotes/slug`
  def destroy
    authorize @edgenote

    @edgenote.destroy
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_edgenote
    @edgenote = Edgenote.where(slug: params[:slug])
                        .includes(case: [:podcasts,
                                         :edgenotes,
                                         pages: [:cards],
                                         enrollments: [:reader]])
                        .first
  end

  def set_case
    @case = Case.where(slug: params[:case_slug])
                .first
  end

  # Only allow a trusted parameter "white list" through.
  def edgenote_params
    params.require(:edgenote).permit(:caption, :format, :thumbnail_url,
                                     :content, :embed_code, :website_url,
                                     :image, :pdf_url, :instructions,
                                     :photo_credit, :slug, :style, :pull_quote,
                                     :attribution, :call_to_action,
                                     :audio, :youtube_slug, :statistics,
                                     :alt_text, :layout, :icon_slug, :file)
  end

  def set_cors_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, PUT, DELETE, GET, OPTIONS'
    headers['Access-Control-Request-Method'] = '*'
    headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, ' \
                                              'Content-Type, Accept, ' \
                                              'Authorization'
  end
end
