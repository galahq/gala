# frozen_string_literal: true

module Cases
  # A subset of case data
  class PreviewSerializer < ApplicationSerializer
    attributes :acknowledgements, :audience, :authors, :commentable, :cover_url,
               :dek, :featured_at, :kicker, :latitude, :learning_objectives,
               :longitude, :photo_credit, :published_at, :slug,
               :small_cover_url, :summary, :teaching_guide_url, :title,
               :translators, :zoom

    has_many :tags

    link(:self) { case_path object }
  end
end
