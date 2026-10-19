# frozen_string_literal: true

class LinkExpansion
  # OEmbed resource
  class Embed
    FETCH_ERRORS = [OEmbed::Error, SocketError, SystemCallError, Timeout::Error,
                    OpenSSL::SSL::SSLError, URI::Error].freeze
    # ruby-oembed deletes its own :timeout option before making the request,
    # so the fetch is bounded here instead
    FETCH_TIMEOUT = 5

    def self.for(url, with_visibility:)
      new(url, with_visibility)
    rescue OEmbed::NotFound
      # Most links have no registered embed provider, and a provider that
      # answers 404 for a link raises this too. Either way there is no embed
      # to show, so there is nothing to report.
      {}
    rescue *FETCH_ERRORS => e
      Rails.logger.warn "Link expansion embed failed for #{url}: #{e.class}: #{e.message}"
      {}
    end

    def initialize(url, visibility)
      @resource = Timeout.timeout(FETCH_TIMEOUT) { OEmbed::Providers.get url }
      @visibility = visibility
    end

    def as_json(_)
      return if @visibility.no_embed

      { __html: @resource.html }
    end
  end
end
