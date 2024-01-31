# frozen_string_literal: true

class LinkExpansion
  # OEmbed resource
  class Embed
    def self.for(url, with_visibility:)
      instance = new(url, with_visibility)
    rescue OEmbed::NotFound, OEmbed::UnknownResponse
      {}
    end

    def initialize(url, visibility)
      @resource = OEmbed::Providers.get url
      @visibility = visibility
    end

    def as_json(_)
      return if @visibility.no_embed

      { __html: @resource.html }
    end
  end
end
