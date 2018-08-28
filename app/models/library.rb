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

  HEX_COLOR = /\A#\h{6}\z/

  attribute :background_color, :text, default: '#000000'
  attribute :foreground_color, :text, default: '#ffffff'
  friendly_id :name, use: %i[history slugged]
  time_for_a_boolean :visible_in_catalog
  translates :name, :description, :url, fallbacks: true

  has_many :cases, dependent: :nullify
  has_many :managerships, dependent: :destroy
  has_many :managers, through: :managerships

  has_one_attached :logo

  validates :name, presence: true
  validates :background_color, :foreground_color,
            format: { with: HEX_COLOR }, allow_blank: true

  scope :ordered, -> { order cases_count: :desc }
end
