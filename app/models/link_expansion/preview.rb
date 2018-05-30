# frozen_string_literal: true

class LinkExpansion
  # OpenGraph link preview
  class Preview
    def self.for(url, with_visibility:)
      new url, with_visibility
    end

    def initialize(url, visibility)
      @open_graph = OpenGraph.new url
      @visibility = visibility
    end

    def as_json(_)
      {
        title: @open_graph.title,
        type: @open_graph.type,
        url: @open_graph.url,
        description: description,
        images: images
      }
    end

    private

    def description
      return if @visibility.no_description
      @open_graph.description || ''
    end

    def images
      return if @visibility.no_image
      @open_graph.images || []
    end
  end
end
