# frozen_string_literal: true

class AddReaderToCommentThreads < ActiveRecord::Migration[5.0]
  def change
    add_reference :comment_threads, :reader, foreign_key: true
  end
end
