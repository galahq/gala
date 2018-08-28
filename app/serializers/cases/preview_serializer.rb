# frozen_string_literal: true

module Cases
  # A subset of case data
  class PreviewSerializer < ApplicationSerializer
    attributes :cover_url, :dek, :featured_at, :kicker, :latitude, :longitude,
               :photo_credit, :published_at, :slug, :small_cover_url, :title

    has_many :tags

    link(:self) { case_path object }
  end
end
