class CreateComments < ActiveRecord::Migration[5.0]
  def change
    create_table :comments do |t|
      t.hstore :content_i18n
      t.references :reader, foreign_key: true
      t.references :comment_thread, foreign_key: true

      t.timestamps
    end
  end
end
