class CatalogController < ApplicationController
  def home
    @cases = Case.where.not(cover_url: nil)
      .includes(:activities, :podcasts, :enrollments, :edgenotes, pages: [:cards])
      .sort_by &:kicker
    @my_cases = current_reader.cases.order(updated_at: :desc) if reader_signed_in?

    cases_in_catalog = @cases - @my_cases rescue @cases
    @featured = cases_in_catalog.select(&:featured?).sort.reverse
    @index = cases_in_catalog.select(&:in_index?).sort_by &:kicker
    render layout: "window"
  end
end
