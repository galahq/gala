# frozen_string_literal: true

# Use OpenGraph and OEmbed to come up with default content for an Edgenote
# with a link
class LinkExpansion
  # OpenGraph link preview
  class Preview
    def initialize(url)
      @open_graph = OpenGraph.new url
    end

    def as_json(_)
      {
        title: @open_graph.title,
        type: @open_graph.type,
        url: @open_graph.url,
        description: @open_graph.description,
        images: @open_graph.images
      }
    end
  end

  def initialize(url)
    @preview = Preview.new url
  end
end
