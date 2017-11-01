# frozen_string_literal: true

class Library < ApplicationRecord
  HEX_COLOR = /\A#(?:[0-9a-fA-F]{3}){1,2}\z/

  include Mobility
  translates :name, :description, :url, fallbacks: true

  has_many :cases

  validates :background_color, :foreground_color, format: { with: HEX_COLOR }
end
