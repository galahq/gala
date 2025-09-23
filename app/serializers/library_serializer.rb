# frozen_string_literal: true

# @see Library
class LibrarySerializer < ApplicationSerializer
  attributes :slug, :name, :description, :logo_url, :small_logo_url, 
             :medium_logo_url, :large_logo_url, :background_color,
             :foreground_color, :pending_request_count
  link(:self) do
    object.catalog_path
  end
  link(:edit) do
    object.edit_path
  end
end
