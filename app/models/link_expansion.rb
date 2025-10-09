# frozen_string_literal: true

# Use OpenGraph and OEmbed to come up with default content for an Edgenote
# with a link
class LinkExpansion
  def initialize(url, visibility = nil)
    visibility ||= DefaultVisibility.instance
    @preview = Preview.for url, with_visibility: visibility
    @embed = determine_embed_type(url, visibility)
  end

  private

  def determine_embed_type(url, visibility)
    # Check if it's a trusted domain first
    if GithubPagesEmbed.new(url, visibility).trusted_domain?
      GithubPagesEmbed.for url, with_visibility: visibility
    else
      Embed.for url, with_visibility: visibility
    end
  end
end
