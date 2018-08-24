# frozen_string_literal: true

# @see Library
class LibraryDecorator < ApplicationDecorator
  def catalog_path
    h.catalog_path react_router_location: "libraries/#{slug}"
  end

  def define_color_variables
    <<~CSS
      --library-background: #{background_color};
      --library-foreground: #{foreground_color};
    CSS
  end
end
