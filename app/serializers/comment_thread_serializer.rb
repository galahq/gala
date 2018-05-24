# frozen_string_literal: true

# @see CommentThread
class CommentThreadSerializer < ApplicationSerializer
  attributes :id, :card_id, :original_highlight_text, :reader_id,
             :comments_count
  attributes :block_index, :start, :length
  attribute(:comment_ids) { object.comments.pluck(:id) }

  has_many :collocutors, key: :readers, serializer: Readers::IdenticonSerializer

  delegate :block_index, :start, :length, to: :@range_calculator

  def initialize(*props)
    super(*props)
    @range_calculator = CommentThreadRangeCalculator.new object
  end
end
