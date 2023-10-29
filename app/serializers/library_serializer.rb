# frozen_string_literal: true

# @see Library
class LibrarySerializer < ApplicationSerializer
  attributes :slug, :name, :description, :logo_url, :background_color,
             :foreground_color, :pending_request_count
  link(:self) do
    object.catalog_path
  end
  link(:edit) { edit_library_path(object) }
end
