# frozen_string_literal: true

class LinkExpansion
  # OEmbed resource
  class Embed
    FETCH_ERRORS = [OEmbed::Error, SocketError, SystemCallError, Timeout::Error,
                    OpenSSL::SSL::SSLError, URI::Error].freeze

    def self.for(url, with_visibility:)
      new(url, with_visibility)
    rescue *FETCH_ERRORS => e
      Rails.logger.warn "Link expansion embed failed for #{url}: #{e.class}: #{e.message}"
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
