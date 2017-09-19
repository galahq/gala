# frozen_string_literal: true

class CatalogController < ApplicationController
  before_action :validate_lti_request!, only: [:content_items]

  def home
    render layout: 'with_header'
  end

  # LTI Assignment Selection wants to POST a ContentItemSelectionRequest
  def content_items
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
