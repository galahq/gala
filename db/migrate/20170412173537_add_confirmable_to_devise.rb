# frozen_string_literal: true

class AddConfirmableToDevise < ActiveRecord::Migration[5.0]
  def up
    add_column :readers, :confirmation_token, :string
    add_column :readers, :confirmed_at, :datetime
    add_column :readers, :confirmation_sent_at, :datetime
    add_column :readers, :unconfirmed_email, :string # reconfirmable
    add_index :readers, :confirmation_token, unique: true
    # To avoid a short time window between running the migration and updating all existing
    # readers as confirmed, do the following
    execute('UPDATE readers SET confirmed_at = NOW()')
  end

  def down
    remove_columns :readers, :confirmation_token, :confirmed_at, :confirmation_sent_at
    remove_columns :readers, :unconfirmed_email
  end
end
