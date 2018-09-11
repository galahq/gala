# frozen_string_literal: true

class AddIconSlugToPages < ActiveRecord::Migration[5.2]
  def change
    add_column :pages, :icon_slug, :text
  end
end
