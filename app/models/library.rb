# frozen_string_literal: true

# A collection of {Case} with common provenance. “Michigan Sustainability Cases”
# is our library, others could be added in the future.
#
# @attr slug [String] the URL-safe unique identifier for the library
# @attr name [Translated<String>] the library’s name
# @attr description [Translated<String>] a couple of sentences of background
# @attr url [Translated<String>] a link to the library’s website
# @attr background_color [Color] the background color for the library’s banner
# @attr foreground_color [Color] the foreground color for the library’s banner
class Library < ApplicationRecord
  include Mobility
  extend FriendlyId

  HEX_COLOR = /\A#\h{6}\z/.freeze

  attribute :background_color, :text, default: '#000000'
  attribute :foreground_color, :text, default: '#ffffff'
  friendly_id :name, use: %i[history slugged]
  time_for_a_boolean :visible_in_catalog
  translates :name, :description, :url, fallbacks: true

  has_many :cases, dependent: :nullify
  has_many :managerships, dependent: :destroy
  has_many :managers, through: :managerships
  has_many :requests, class_name: 'CaseLibraryRequest', dependent: :destroy

  has_one_attached :logo

  validates :background_color, :foreground_color,
            format: { with: HEX_COLOR }, allow_blank: true
  validates :logo, size: { less_than: 2.megabytes,
                           message: 'cannot be larger than 2 MB' },
                   content_type: { in: %w[image/png], message: 'must be PNG' }
  validates :name, presence: true

  scope :ordered, -> { order cases_count: :desc }
  scope :visible_in_catalog, -> { where 'visible_in_catalog_at < NOW()' }

  def self.find(id)
    return SharedCasesLibrary.instance if id.blank?

    super(id)
  end
end
