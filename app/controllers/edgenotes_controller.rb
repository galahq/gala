# frozen_string_literal: true

# @see Edgenote
class EdgenotesController < ApplicationController
  before_action :set_edgenote, only: %i[show update destroy]
  before_action :set_case, only: [:create]
  before_action :set_cors_headers, only: [:show]

  decorates_assigned :edgenote

  # @route [POST] `/cases/case-slug/edgenotes`
  def create
    authorize @case, :update?

    @edgenote = @case.edgenotes.build

    if @edgenote.save
      render partial: 'edgenote', locals: { edgenote: edgenote }
    else
      render json: @edgenote.errors, status: :unprocessable_entity
    end
  end

  # @route [PATCH/PUT] `/edgenotes/slug`
  def update
    authorize @edgenote.case, :update?

    if @edgenote.update(edgenote_params)
      render partial: 'edgenote', locals: { edgenote: edgenote }
    else
      render json: @edgenote.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/edgenotes/slug`
  def destroy
    authorize @edgenote.case, :update?

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
                                     :alt_text)
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
