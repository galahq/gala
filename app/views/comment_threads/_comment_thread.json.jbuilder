# frozen_string_literal: true

json.key_format! camelize: :lower
json.extract! comment_thread, :id, :card_id, :original_highlight_text,
              :reader_id, :comments_count
json.comment_ids comment_thread.comments.map(&:id)
json.readers comment_thread.collocutors do |reader|
  json.extract! reader, :image_url, :email, :name
end

json.extract! CommentThreadRangeCalculator.new(comment_thread),
              :block_index, :start, :length
