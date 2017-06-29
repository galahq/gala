# frozen_string_literal: true

class AddUrlToEdgenotes < ActiveRecord::Migration[5.0]
  def change
    add_column :edgenotes, :instructions_i18n, :hstore
    add_column :edgenotes, :image_url_i18n, :hstore
    add_column :edgenotes, :website_url_i18n, :hstore
    add_column :edgenotes, :embed_code_i18n, :hstore
  end
end
