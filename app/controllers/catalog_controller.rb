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
    I18n.locale = params[:launch_presentation_locale]

    set_group

    session[:content_item_selection_params] = {return_url:
    params[:content_item_return_url], return_data: params[:data]}

    @items = Case.where(published: true).sort_by(&:kicker)
    render layout: "embed"
  end

  private

  def set_group
    begin
      @group = Group.upsert context_id: params[:context_id], name: params[:context_title]
    rescue
      retry
    end
  end
end
