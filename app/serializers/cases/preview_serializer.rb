# frozen_string_literal: true

module Cases
  # A subset of case data
  class PreviewSerializer < ApplicationSerializer
    attributes :acknowledgements, :audience, :authors, :commentable, :cover_url,
               :dek, :featured_at, :kicker, :latitude, :learning_objectives,
               :longitude, :photo_credit, :published_at, :slug,
               :small_cover_url, :summary, :title, :translators, :zoom

    has_many :tags

    link(:new_translation) { new_case_translation_path object }
    link(:self) { case_path object }
    link(:settings) { edit_case_settings_path object }
    link(:taggings) { case_taggings_path object }
    link(:teach) { new_deployment_path case_slug: object.slug }
  end
end
