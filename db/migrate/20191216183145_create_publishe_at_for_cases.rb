class CreatePublisheAtForCases < ActiveRecord::Migration[6.0]
  def change
    add_column :cases, :published_at, :timestamp

    reversible do |dir|
      dir.up do
        Case.find_each do |c|
          c.published_at = c.published ? c.publication_date : nil
          c.save
        end
      end
      dir.down do
        Case.find_each do |c|
          c.publication_date = c.published_at
          c.published = !!c.published_at
          c.save
        end
      end
    end

    remove_column :cases, :publication_date, :date
    remove_column :cases, :published, :boolean, default: false
  end
end
