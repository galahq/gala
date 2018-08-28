# frozen_string_literal: true

# @see Library
class LibrarySerializer < ApplicationSerializer
  attributes :slug, :name, :description, :logo_url, :background_color,
             :foreground_color
  link(:self) do
    object.catalog_path
  end
end
