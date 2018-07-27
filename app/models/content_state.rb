# frozen_string_literal: true

# A value object representing the contents of a {Card}
class ContentState
  attr_reader :raw_content

  def initialize(raw_content)
    @raw_content = raw_content
  end

  def paragraphs
    return [] unless @raw_content&.key? :blocks
    @raw_content[:blocks].map { |x| x[:text] }
  end
  end
end
