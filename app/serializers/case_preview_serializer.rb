# frozen_string_literal: true

# A subset of case data
class CasePreviewSerializer < ApplicationSerializer
  attributes :acknowledgements, :audience, :authors, :commentable, :cover_url,
             :dek, :featured_at, :kicker, :latitude, :learning_objectives,
             :longitude, :other_available_locales, :photo_credit, :published_at,
             :slug, :small_cover_url, :summary, :title, :translators, :zoom

  link(:self) { case_path(I18n.locale, object) }
  link(:settings) { edit_case_settings_path(I18n.locale, object) }
  link(:teach) { new_deployment_path(case_slug: object.slug) }
end
