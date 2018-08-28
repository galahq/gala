# frozen_string_literal: true

# @see Case
class CaseSerializer < Cases::PreviewSerializer
  attributes :acknowledgements, :audience, :authors, :commentable,
             :learning_objectives, :other_available_locales, :summary,
             :teaching_guide_url, :translators, :zoom

  belongs_to :library

  has_many :case_elements

  has_many_by_id :activities
  has_many_by_id :cards
  has_many_by_id :edgenotes
  has_many_by_id :pages
  has_many_by_id :podcasts
end
