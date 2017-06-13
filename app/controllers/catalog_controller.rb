class CatalogController < ApplicationController
  before_action :validate_lti_request!, only: [:content_items]

  def home
    @cases = Case.where.not(cover_url: "").where.not(cover_url: nil)
      .sort_by &:kicker
    @my_cases = current_reader.enrollments.order(updated_at: :desc).map(&:case) if reader_signed_in?

    cases_in_catalog = @cases - @my_cases rescue @cases
    @featured = cases_in_catalog.select(&:featured?).sort.reverse
    @index = cases_in_catalog.select(&:in_index?).sort_by &:kicker
    render layout: "window"
  end

  # LTI Assignment Selection wants to POST a ContentItemSelectionRequest
  def content_items
    linker = LmsLinkerService.new(params)

    sign_in linker.reader if linker.reader
    linker.add_reader_to_group

    @group = linker.group
    session[:active_group_id] = @group.id

    save_selection_params_to_session

    @items = Case.all.sort_by(&:kicker)
    render layout: "embed"
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
