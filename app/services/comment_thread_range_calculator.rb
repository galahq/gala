# frozen_string_literal: true

# Calculates the correct positioning of the comment_thread in its card’s text
# by looking for the first occurance of its highlight text. It is the consumer’s
# responsibility to ensure that substring is unique.
class CommentThreadRangeCalculator
  def initialize(comment_thread)
    @comment_thread = comment_thread
    search
  end

  attr_reader :block_index, :start

  def length
    @comment_thread.original_highlight_text.length
  rescue
    0
  end

  private

  def search
    @comment_thread.card.paragraphs.each_with_index do |paragraph, block_index|
      if (@start = paragraph.index(@comment_thread.original_highlight_text))
        @block_index = block_index
        break
      end
    end
  end
end
