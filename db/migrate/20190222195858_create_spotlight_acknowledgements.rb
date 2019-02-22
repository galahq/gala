class CreateSpotlightAcknowledgements < ActiveRecord::Migration[5.2]
  def change
    create_table :spotlight_acknowledgements do |t|
      t.references :reader, foreign_key: true
      t.string :spotlight_key

      t.timestamps
    end
  end
end
