class AddAuthenticationTokenToReader < ActiveRecord::Migration[5.0]
  def change
    add_column :readers, :authentication_token, :text
    add_index :readers, :authentication_token, unique: true
  end
end
