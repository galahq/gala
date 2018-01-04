# frozen_string_literal: true

class MagicLinksController < ApplicationController
  include MagicLink

  # GET /magic_link?key=ABCDEF
  def show
    @deployment = Deployment.find_by_key params['key']

    if @deployment
      render layout: 'window'
    else
      head :not_found
    end
  end

  # POST /magic_link?key=ABCDEF
  def create
    save_deployment_in_session
    link_reader
    redirect_to after_linking_redirect_path
  end
end
