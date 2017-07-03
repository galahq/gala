# frozen_string_literal: true

class AddLocaleToReader < ActiveRecord::Migration[5.0]
  def change
    add_column :readers, :locale, :text
  end
end
