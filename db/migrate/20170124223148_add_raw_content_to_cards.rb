# frozen_string_literal: true

class AddRawContentToCards < ActiveRecord::Migration[5.0]
  def change
    add_column :cards, :raw_content_i18n, :hstore
  end
end
