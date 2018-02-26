# frozen_string_literal: true

# A collection of {Case} with common provenance. “Michigan Sustainability Cases”
# is our library, others could be added in the future.
#
# @attr slug [String] the URL-safe unique identifier for the library
# @attr name [Translated<String>] the library’s name
# @attr description [Translated<String>] a couple of sentences of background
# @attr url [Translated<String>] a link to the library’s website
# @attr logo_url [String] a logo to identify the library
# @attr background_color [Color] the background color for the library’s banner
# @attr foreground_color [Color] the foreground color for the library’s banner
class Library < ApplicationRecord
  include Mobility

  HEX_COLOR = /\A#(?:[0-9a-fA-F]{3}){1,2}\z/

  translates :name, :description, :url, fallbacks: true

  has_many :cases

  has_many :managerships, dependent: :destroy
  has_many :managers, through: :managerships

  validates :background_color, :foreground_color, format: { with: HEX_COLOR }
end
