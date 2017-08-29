# frozen_string_literal: true

json.key_format! camelize: :lower
json.call(comment_thread, :id, :card_id, :block_index, :start, :length,
          :original_highlight_text, :reader_id, :comments_count)
json.comment_ids comment_thread.comments.map(&:id)
