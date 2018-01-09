# frozen_string_literal: true

# An element of curated media which accompanies a case narrative. Edgenotes
# are referenced from {Card#raw_content} as a `DraftEntity` but have an
# association to {Case} for efficient preloading.
#
# `v2` Edgenotes have a clean design which looks less like a textbook than `v1`,
# which is deprecated. As of `v2`, Edgenote attributes have the following
# styles, in order of precedence.
#
# ### Video
# If {youtube_slug} is set, then these attributes are used:
# - {youtube_slug}
# - {caption}
#
# ### Quotation
# If {pull_quote} or {audio_url} are set, then these attributes are used:
# - {pull_quote}
# - {attribution}
# - {audio_url} (quotation is expected to be an excerpt from the audio, if set)
# - {caption}
# - {call_to_action}
# - {website_url}
#
# ### Image
# If {image_url} is set, then these attributes are used:
# - {image_url} (the image will zoom unless the Edgenote is a link)
# - {photo_credit}
# - {alt_text}
# - {caption}
# - {call_to_action}
# - {website_url}
#
# @note The Edgenote will only act as a link if {website_url} and
#   {call_to_action} are set
#
# @attr slug [String] a unique, URL-safe identifier
# @attr style [:v1, :v2] deprecated `v1` or new-style `v2`
# @attr caption [Translated<String>]
# @attr image_url [Translated<String>]
# @attr website_url [Translated<String>]
# @attr photo_credit [Translated<String>]
# @attr pull_quote [Translated<String>]
# @attr attribution [Translated<String>]
# @attr call_to_action [Translated<String>]
# @attr audio_url [Translated<String>]
# @attr youtube_slug [Translated<String>]
# @attr alt_text [String] @todo translate this
class Edgenote < ApplicationRecord
  include Authority::Abilities
  include Mobility
  include Trackable

  translates :caption, :content, :instructions, :image_url, :website_url,
             :embed_code, :photo_credit, :pdf_url, :pull_quote, :attribution,
             :call_to_action, :audio_url, :youtube_slug, fallbacks: true

  enum style: { v1: 0, v2: 1 }

  belongs_to :case, touch: true
  belongs_to :card

  validates :format, inclusion: { in: %w[aside audio graphic link photo quote
                                         report video] }

  # The name of the corresponding {Ahoy::Event}s
  # @see Trackable#event_name
  def event_name
    'visit_edgenote'
  end

  # The filter parameters used to find the corresponding {Ahoy::Event}s
  # @see Trackable#event_properties
  def event_properties
    { edgenote_slug: slug }
  end

  def to_param
    slug
  end
end
