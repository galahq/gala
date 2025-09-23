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

  def logo_url(options = {})
    return object.logo_url unless object.respond_to? :logo
    return nil unless logo.attached?
    
    ImageDecorator.decorate(logo).resized_path(**options)
  end

  # Small logo for search results and case list overlays (20x20px)
  def small_logo_url
    logo_url width: 20, height: 20
  end

  # Medium logo for library grid display (50x50px)
  def medium_logo_url
    logo_url width: 50, height: 50
  end

  # Large logo for library info pages and banners (100x100px)
  def large_logo_url
    logo_url width: 100, height: 100
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
