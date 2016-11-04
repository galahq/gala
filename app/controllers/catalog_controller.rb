class CatalogController < ApplicationController
  def home
    @cases = Case.where.not(cover_url: nil)
      .includes(:activities, :podcasts, :enrollments, :edgenotes, pages: [:cards])
      .sort_by &:kicker
    @featured = @cases.select(&:featured?).sort.reverse
    @index = @cases.select(&:in_index?).sort_by &:kicker
    render layout: "window"
  end
end
