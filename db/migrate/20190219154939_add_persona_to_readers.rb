class AddPersonaToReaders < ActiveRecord::Migration[5.2]
  def change
    add_column :readers, :persona, :string
  end
end
