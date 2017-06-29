# frozen_string_literal: true

class AddCommentableFlagToCase < ActiveRecord::Migration[5.0]
  def change
    add_column :cases, :commentable, :boolean
  end
end
