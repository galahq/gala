class ModifyLocaleAndTranslationBaseIdToCases < ActiveRecord::Migration[6.0]
  class MigrationCase < ActiveRecord::Base
    self.table_name = 'cases'
  end

  def change
    add_column :cases, :locale, :text
    add_reference :cases, :translation_base,
                  foreign_key: { to_table: :cases }

    reversible do |dir|
      dir.up do
        MigrationCase.update_all Arel.sql <<~SQL
          locale = 'en', translation_base_id = id
        SQL
      end
    end

    change_column_null :cases, :locale, false
  end
end
