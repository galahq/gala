# frozen_string_literal: true

class AddKickerDekToCase < ActiveRecord::Migration[5.0]
  def change
    add_column :cases, :kicker_i18n, :hstore
    add_column :cases, :dek_i18n, :hstore
  end
end
