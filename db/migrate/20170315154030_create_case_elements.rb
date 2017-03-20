class CreateCaseElements < ActiveRecord::Migration[5.0]
  def change
    create_table :case_elements do |t|
      t.references :case, foreign_key: true
      t.references :element, polymorphic: true
      t.integer :position

      t.timestamps
    end

    reversible do |dir|
      dir.up do
        Case.all.includes(:pages, :podcasts, :activities).each do |kase|
          (kase.pages + kase.podcasts + kase.activities).each do |element|
            kase.case_elements.create(element: element)
          end
        end
      end

      dir.down do
      end
    end
  end
end
