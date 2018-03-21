# frozen_string_literal: true

# Use OpenGraph and OEmbed to come up with default content for an Edgenote
# with a link
class LinkExpansion
  def initialize(url, visibility = nil)
    visibility ||= DefaultVisibility.instance
    @preview = Preview.new url, visibility
  end
end
