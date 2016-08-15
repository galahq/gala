class CreateActivities < ActiveRecord::Migration[5.0]
  def change
    create_table :activities do |t|
      t.hstore :title_i18n
      t.hstore :description_i18n
      t.hstore :pdf_url_i18n
      t.references :case, foreign_key: true

      t.timestamps
    end
  end
end
