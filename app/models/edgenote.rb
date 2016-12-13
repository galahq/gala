class Edgenote < ApplicationRecord
  include Authority::Abilities

  belongs_to :case
  belongs_to :card

  translates *%i(caption content instructions image_url website_url
    embed_code photo_credit pdf_url pull_quote attribution call_to_action
                 audio_url youtube_slug)

  validates :format, inclusion: {in: %w{aside audio graphic link photo quote report video}}

  enum style: %i(v1 v2)

  include Trackable
  def event_name
    'visit_edgenote'
  end

  def event_properties
    { edgenote_slug: slug }
  end
end
