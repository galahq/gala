class CreateCommentThreads < ActiveRecord::Migration[5.0]
  def change
    create_table :comment_threads do |t|
      t.references :case, foreign_key: true
      t.references :group, foreign_key: true

      t.timestamps
    end
  end
end
