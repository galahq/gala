# frozen_string_literal: true

# @see Case
class CaseSerializer < CasePreviewSerializer
  belongs_to :library

  has_many :case_elements

  has_many_by_id :activities
  has_many_by_id :cards
  has_many_by_id :edgenotes
  has_many_by_id :pages
  has_many_by_id :podcasts
end
