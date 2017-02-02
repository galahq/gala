class AddEntityRangeDataToCommentThread < ActiveRecord::Migration[5.0]
  def change
    add_column :comment_threads, :start, :integer
    add_column :comment_threads, :length, :integer
    add_column :comment_threads, :block_index, :integer
    add_column :comment_threads, :original_highlight_text, :string
    add_column :comment_threads, :locale, :string
    add_reference :comment_threads, :card, foreign_key: true
  end
end
