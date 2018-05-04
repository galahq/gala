# frozen_string_literal: true

# @see Library
class LibrarySerializer < ApplicationSerializer
  attributes :slug, :name, :description, :url, :logo_url, :background_color,
             :foreground_color
end
