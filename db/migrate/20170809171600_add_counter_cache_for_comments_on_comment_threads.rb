# frozen_string_literal: true

class AddCounterCacheForCommentsOnCommentThreads < ActiveRecord::Migration[5.0]
  def change
    add_column :comment_threads, :comments_count, :integer

    CommentThread.find_each do |x|
      CommentThread.reset_counters(x.id, :comments)
    end
  end
end
