class AddTosToReaders < ActiveRecord::Migration[6.0]
  def change
    add_column :readers, :terms_of_service, :integer
  end
end
