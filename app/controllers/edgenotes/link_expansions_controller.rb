# frozen_string_literal: true

module Edgenotes
  # @see LinkExpansion
  class LinkExpansionsController < ApplicationController
    before_action :set_edgenote

    # @param [GET] /edgenotes/edgenote-slug/link_expansion?href="https://..."
    def show
      return head :not_found if href.blank?

      render json: link_expansion
      expires_in 1.day
    end

    # @param [PUT/PATCH] /edgenotes/edgenote-slug/link_expansion
    def update
      authorize @edgenote.case, :update?

      visibility = @edgenote.find_or_build_link_expansion_visibility

      if visibility.update visibility_params
        render json: link_expansion
      else
        head :unprocessable_entity
      end
    end

    private

    def set_edgenote
      @edgenote = Edgenote.find_by! slug: params[:edgenote_slug]
    end

    def link_expansion
      @link_expansion ||= LinkExpansion.new href, visibility
    end

    # Anyone may expand the edgenote’s saved link. Only the case’s editors may
    # expand a different one (the unsaved link they are typing), so the
    # endpoint can’t be used to make the server fetch arbitrary URLs.
    def href
      @href ||= if editor_preview?
                  params[:href]
                else
                  @edgenote.website_url
                end
    end

    def editor_preview?
      requested = params[:href]
      return false if requested.blank? || requested == @edgenote.website_url
      return false unless http_url? requested

      policy(@edgenote.case).update?
    end

    def http_url?(url)
      URI.parse(url).is_a? URI::HTTP
    rescue URI::InvalidURIError
      false
    end

    def visibility
      @edgenote.link_expansion_visibility
    end

    def visibility_params
      params.require(:visibility).permit(:no_description, :no_embed, :no_image)
    end
  end
end
