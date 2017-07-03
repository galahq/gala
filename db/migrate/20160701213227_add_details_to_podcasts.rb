# frozen_string_literal: true

class AddDetailsToPodcasts < ActiveRecord::Migration[5.0]
  def change
    add_column :podcasts, :artwork_url, :string
    add_column :podcasts, :credits_i18n, :hstore
  end
end
