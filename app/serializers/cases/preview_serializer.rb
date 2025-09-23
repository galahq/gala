# frozen_string_literal: true

module Cases
  # A subset of case data
  class PreviewSerializer < ApplicationSerializer
    attributes :authors, :cover_url, :dek, :featured_at, :kicker, :latitude,
               :longitude, :photo_credit, :published_at, :slug,
               :small_cover_url, :title, :updated_at

    has_many :tags

    link(:self) { case_path object }

    def kicker
      object.short_title
    end
  end
end
