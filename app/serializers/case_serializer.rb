# frozen_string_literal: true

# @see Case
class CaseSerializer < Cases::PreviewSerializer
  attributes :acknowledgements, :audience, :commentable, :license_config,
             :learning_objectives, :summary, :teaching_guide_url, :translators,
             :zoom
  attribute :other_available_locales

  belongs_to :library

  has_many :case_elements

  has_many_by_id :cards
  has_many_by_id :edgenotes
  has_many_by_id :pages
  has_many_by_id :podcasts
  has_many_by_id :wikidata_links

  def other_available_locales
    object.other_available_locales(for_reader: current_user)
  end
end
