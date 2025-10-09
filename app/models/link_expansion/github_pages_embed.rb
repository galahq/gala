# frozen_string_literal: true

class LinkExpansion
  # Custom embed handler for trusted GitHub Pages and other trusted domains
  class GithubPagesEmbed
    def self.for(url, with_visibility:)
      new(url, with_visibility)
    rescue => e
      Rails.logger.error "GithubPages embed failed for #{url}: #{e.message}"
      {}
    end

    def initialize(url, visibility)
      @url = url
      @visibility = visibility
    end

    def as_json(_)
      return if @visibility.no_embed
      return unless trusted_domain?

      { __html: generate_trusted_iframe }
    end

    def trusted_domain?
      return false if @url.blank?

      # Check if URL points to a trusted domain
      uri = URI.parse(@url)
      return false unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)

      # Check against the trusted domains list from the controller
      trusted_domains = %w[
        ocelots-rcn.github.io
        # Add more trusted domains here as needed
      ]

      trusted_domains.any? { |domain| uri.host.include?(domain) }
    rescue URI::InvalidURIError
      false
    end

    private

    def generate_trusted_iframe
      # Use the proxy endpoint to serve the trusted domain content
      default_options = Rails.application.config.action_controller.default_url_options || {}
      host = default_options[:host] || 'localhost:3000'
      
      proxy_url = Rails.application.routes.url_helpers.github_pages_url(
        url: @url,
        host: host
      )

      %(<iframe src="#{proxy_url}" width="100%" height="600px" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>)
    end
  end
end
