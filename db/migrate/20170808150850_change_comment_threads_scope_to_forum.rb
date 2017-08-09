# frozen_string_literal: true

class ChangeCommentThreadsScopeToForum < ActiveRecord::Migration[5.0]
  def change
    add_reference :comment_threads, :forum, foreign_key: true
    remove_reference :comment_threads, :group, foreign_key: true
  end
end
