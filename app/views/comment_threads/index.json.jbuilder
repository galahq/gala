# frozen_string_literal: true

json.key_format! camelize: :lower

by_id json,
      comment_threads: @comment_threads,
      comments: @comment_threads.flat_map(&:comments),
      cards: @case.cards
