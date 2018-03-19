# frozen_string_literal: true

module Edgenotes
  # @see LinkExpansion
  class LinkExpansionsController < ApplicationController
    # @param [GET] /edgenotes/link?href="https://..."
    def show
      render json: LinkExpansion.new(params[:href])
      expires_in 1.day
    end
  end
end
