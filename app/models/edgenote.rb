# frozen_string_literal: true

class Edgenote < ApplicationRecord
  include Authority::Abilities

  belongs_to :case
  belongs_to :card

  include Mobility
  translates :caption, :content, :instructions, :image_url, :website_url,
             :embed_code, :photo_credit, :pdf_url, :pull_quote, :attribution,
             :call_to_action, :audio_url, :youtube_slug, fallbacks: true

  validates :format, inclusion: { in: %w[aside audio graphic link photo quote
                                         report video] }

  enum style: %i[v1 v2]

  include Trackable
  def event_name
    'visit_edgenote'
  end

  def event_properties
    { edgenote_slug: slug }
  end

  def to_param
    slug
  end
end
