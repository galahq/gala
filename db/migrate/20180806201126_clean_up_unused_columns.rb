# frozen_string_literal: true

class CleanUpUnusedColumns < ActiveRecord::Migration[5.2]
  def change
    remove_column :activities, :description
    remove_column :cards, :content
    remove_column :cases, :narrative
    remove_column :cases, :short_title
    remove_column :cases, :tags
    remove_column :comment_threads, :start
    remove_column :comment_threads, :length
    remove_column :comment_threads, :block_index
    remove_column :podcasts, :description
  end
end
