# frozen_string_literal: true

# @see Library
class LibraryDecorator < ApplicationDecorator
  def catalog_path
    super react_router_location: "libraries/#{slug}"
  end

  def define_color_variables
    <<~CSS
      --library-background: #{background_color};
      --library-foreground: #{foreground_color};
    CSS
  end

  def logo_url
    return object.logo_url unless object.respond_to? :logo
    return nil unless logo.attached?
    polymorphic_path logo, only_path: true
  end

  def serializer_class
    LibrarySerializer
  end

  def edit_path
    return nil if object == SharedCasesLibrary.instance
    edit_library_path object
  end

  def pending_request_count
    object.requests.pending.count
  end
end
