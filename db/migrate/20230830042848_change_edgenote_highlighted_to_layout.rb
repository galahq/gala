class ChangeEdgenoteHighlightedToLayout < ActiveRecord::Migration[6.0]
  def up
    change_column_default :edgenotes, :highlighted, nil
    execute <<-SQL
      ALTER TABLE edgenotes
      ALTER COLUMN highlighted TYPE integer
      USING CASE WHEN highlighted = TRUE THEN 1 ELSE 0 END
    SQL
    change_column_default :edgenotes, :highlighted, from: nil, to: 0
    rename_column :edgenotes, :highlighted, :layout
  end

  def down
    rename_column :edgenotes, :layout, :highlighted
    change_column_default :edgenotes, :highlighted, nil
    execute <<-SQL
      ALTER TABLE edgenotes
      ALTER COLUMN highlighted TYPE boolean
      USING CASE WHEN highlighted = 1 THEN TRUE ELSE FALSE END;
    SQL
    change_column_default :edgenotes, :highlighted, from: nil, to: false
  end
end
