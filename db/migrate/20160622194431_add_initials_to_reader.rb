# frozen_string_literal: true

class AddInitialsToReader < ActiveRecord::Migration[5.0]
  def change
    add_column :readers, :initials, :text
  end
end
