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
    include SelectionParams

    skip_before_action :verify_authenticity_token
    before_action :validate_lti_request!

    # @route [POST] `/catalog/content_items`
    def create
      sign_in linker.reader if linker.reader
      linker.call
      save_selection_params_to_session
      redirect_to root_path
    end

    private

    def linker
      @linker ||= LinkerService.new LinkerService::LTIStrategy.new params
    end

    def save_selection_params_to_session
      self.selection_params = {
        lti_uid: params[:user_id],
        return_url: params[:content_item_return_url],
        return_data: params[:data],
        context_id: params[:context_id],
        canvas_deployments_path: group_canvas_deployments_path(linker.group)
      }
    end
  end
end
