json.key_format! camelize: :lower
json.(comment_thread, *%i(id card_id block_index start length
                          original_highlight_text reader_id))
json.comment_ids comment_thread.comments.map(&:id)
