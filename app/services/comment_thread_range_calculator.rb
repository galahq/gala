# frozen_string_literal: true

# Calculates the correct positioning of the comment_thread in its card’s text
# by looking for the first occurance of its highlight text. It is the consumer’s
# responsibility to ensure that substring is unique.
class CommentThreadRangeCalculator
  attr_reader :block_index, :start

  def initialize(comment_thread)
    @comment_thread = comment_thread
    search
  end

  def length
    return 0 unless @comment_thread.original_highlight_text.respond_to? :length
    @comment_thread.original_highlight_text.length
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
