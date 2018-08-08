# frozen_string_literal: true

# @see Library
class LibrarySerializer < ApplicationSerializer
  attributes :slug, :name, :description, :logo_url, :background_color,
             :foreground_color
  link(:self) do
    catalog_path react_router_location: "libraries/#{object.slug}"
  end
end
