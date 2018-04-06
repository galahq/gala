# frozen_string_literal: true

module Edgenotes
  # @see LinkExpansion
  class LinkExpansionsController < ApplicationController
    # @param [GET] /edgenotes/edgenote-slug/link_expansion?href="https://..."
    def show
      render json: link_expansion
      expires_in 1.day
    end

    # @param [PUT/PATCH] /edgenotes/edgenote-slug/link_expansion
    def update
      visibility = edgenote.find_or_build_link_expansion_visibility

      if visibility.update visibility_params
        render json: link_expansion
      else
        head :unprocessible_entity
      end
    end

    private

    def link_expansion
      @link_expansion ||= LinkExpansion.new href, visibility
    end

    def href
      return params[:href] if params.key? :href
      edgenote.website_url if edgenote.present?
    end

    def visibility
      edgenote.try(:link_expansion_visibility)
    end

    def edgenote
      @edgenote ||= Edgenote.find_by_slug params[:edgenote_slug]
    end

    def visibility_params
      params.require(:visibility).permit(:no_description, :no_embed, :no_image)
    end
  end
end
