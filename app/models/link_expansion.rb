# frozen_string_literal: true

# Use OpenGraph and OEmbed to come up with default content for an Edgenote
# with a link
class LinkExpansion
  def initialize(url, visibility = nil)
    visibility ||= DefaultVisibility.instance
    @preview = Preview.for url, with_visibility: visibility
    @embed = Embed.for url, with_visibility: visibility
  end
end
