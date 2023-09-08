# frozen_string_literal: true

# An element of curated media which accompanies a case narrative. Edgenotes
# are referenced from {Card#raw_content} as a `DraftEntity` but have an
# association to {Case} for efficient preloading.
#
# `v2` Edgenotes have a clean design which looks less like a textbook than `v1`,
# which is deprecated.
#
# @attr layout [enum] position and width of the edgenote
# @attr slug [String] a unique, URL-safe identifier
# @attr style [:v1, :v2] deprecated `v1` or new-style `v2`
# @attr caption [String]
# @attr photo_credit [String]
# @attr pull_quote [String]
# @attr attribution [String]
# @attr call_to_action [String]
# @attr audio_url [String]
# @attr alt_text [String] @todo translate this
# @attr website_url [String]
# @attr icon_slug [?String] the slug of the icon to display to represent the
#   attachment type
class Edgenote < ApplicationRecord
  include Lockable
  include Trackable
  extend FriendlyId

  attribute :format, :string, default: 'aside'
  attribute :style, :integer, default: 1 # :v2
  friendly_id :slug

  enum style: { v1: 0, v2: 1 }
  enum layout: { right: 0, bottom_full_width: 1, bottom: 2 }

  belongs_to :case, touch: true

  has_one :link_expansion_visibility, class_name: 'LinkExpansion::Visibility',
                                      dependent: :destroy

  has_one_attached :audio
  has_one_attached :file
  has_one_attached :image

  validates :format, inclusion: { in: %w[aside audio graphic link photo quote
                                         report video] }
  validates :image, size: { less_than: 2.megabytes,
                            message: 'cannot be larger than 2 MB' },
                    content_type: { in: %w[image/png image/jpeg],
                                    message: 'must be JPEG or PNG' }

  before_create :ensure_slug_set

  def self.policy_class
    ElementPolicy
  end

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

  def find_or_build_link_expansion_visibility
    link_expansion_visibility || build_link_expansion_visibility
  end

  def to_param
    slug
  end

  private

  def ensure_slug_set
    self.slug ||= SecureRandom.uuid
  end
end
