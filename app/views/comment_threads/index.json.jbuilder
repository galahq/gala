# frozen_string_literal: true

by_id json,
      comment_threads: @comment_threads,
      comments: @comment_threads.flat_map(&:comments),
      cards: @case.cards
