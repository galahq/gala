# frozen_string_literal: true

module Catalog
  # LTI Assignment Selection wants to POST a ContentItemSelectionRequest, which
  # if valid should show a page that allows the user to select a case. In
  # response to the user’s selection, we have to POST the case’s URL to the URL
  # passed as params[:content_item_return_url].
  #
  # We send the user from this list of cases to deployments#create to initialize
  # the class group and forum. Then they can edit the deployment to add a quiz.
  # deployments#edit is responsible for responding to the tool consumer.
  class ContentItemsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :validate_lti_request!

    # @route [POST] `/catalog/content_items`
    def create
      linker = LinkerService.new LinkerService::LTIStrategy.new params

      sign_in linker.reader if linker.reader
      @group = linker.group

      linker.call

      save_selection_params_to_session

      @items = Case.all.sort_by(&:kicker)
      render layout: 'embed'
    end

    private

    def save_selection_params_to_session
      session[:content_item_selection_params] = {
        lti_uid: params[:user_id],
        return_url: params[:content_item_return_url],
        return_data: params[:data],
        context_id: params[:context_id]
      }
    end
  end
end
