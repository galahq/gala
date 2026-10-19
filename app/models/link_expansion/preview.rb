# frozen_string_literal: true

class LinkExpansion
  # OpenGraph link preview
  class Preview
    # The opengraph_parser gem sets no HTTP timeouts, so a slow site would
    # hold the request until Rack::Timeout kills it.
    FETCH_TIMEOUT = 5

    # What the gem returns when it can't fetch the page: the bare link
    Unreachable = Struct.new(:url) do
      def title = url
      def type = nil
      def description = nil
      def images = []
    end

    def self.for(url, with_visibility:)
      new url, with_visibility
    end

    def initialize(url, visibility)
      @open_graph = fetch url
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

    def fetch(url)
      Timeout.timeout(FETCH_TIMEOUT) { OpenGraph.new url }
    rescue Timeout::Error
      Unreachable.new url
    end

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
