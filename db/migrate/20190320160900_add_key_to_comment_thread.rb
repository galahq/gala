# frozen_string_literal: true

class AddKeyToCommentThread < ActiveRecord::Migration[6.0]
  def change
    add_column :comment_threads, :key, :string

    reversible do |dir|
      dir.up do
        execute 'CREATE EXTENSION IF NOT EXISTS pgcrypto'
        CommentThread.update_all 'key = gen_random_uuid()'
      end
    end

    add_index :comment_threads, :key, unique: true
  end
end
