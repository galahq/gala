class CreateAuthenticationStrategies < ActiveRecord::Migration[5.0]
  def up
    create_table :authentication_strategies do |t|
      t.string   "provider"
      t.string   "uid"
      t.references :reader
      t.timestamps
    end

    Reader.where.not(provider: nil).each do |r|
      r.authentication_strategies.create provider: r.provider, uid: r.uid
    end

    change_column_null(:readers, :encrypted_password, true)
    remove_columns :readers, :provider, :uid
  end

  def down
    add_column :readers, :provider, :string
    add_column :readers, :uid, :string
    change_column_null(:readers, :encrypted_password, false, Devise.friendly_token[0,20])

    AuthenticationStrategy.all.each do |auth|
      auth.reader.update provider: auth.provider, uid: auth.uid
    end

    drop_table :authentication_strategies
  end
end
