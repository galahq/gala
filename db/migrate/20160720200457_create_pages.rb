class CreatePages < ActiveRecord::Migration[5.0]
  def change
    create_table :pages do |t|
      t.integer :position
      t.hstore :title_i18n
      t.references :case, foreign_key: true

      t.timestamps
    end
  end
end
