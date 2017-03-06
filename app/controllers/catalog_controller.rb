class CatalogController < ApplicationController
  def home
    @cases = Case.where.not(cover_url: "").where.not(cover_url: nil)
      .sort_by &:kicker
    @my_cases = current_reader.enrollments.order(updated_at: :desc).map(&:case) if reader_signed_in?

    cases_in_catalog = @cases - @my_cases rescue @cases
    @featured = cases_in_catalog.select(&:featured?).sort.reverse
    @index = cases_in_catalog.select(&:in_index?).sort_by &:kicker
    render layout: "window"
  end
end
