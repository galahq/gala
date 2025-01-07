# frozen_string_literal: true

# This migration changes the default value of the translated columns from nil to an empty hash
# fixes compatibility issues with mobility 1.3.x
class ChangeDefaultForJsonbTranslations < ActiveRecord::Migration[7.0]
  def change
    change_column_default :comments, :content, from: nil, to: {}
    change_column_default :communities, :name, from: nil, to: {}
    change_column_default :communities, :description, from: nil, to: {}
    change_column_default :groups, :name, from: nil, to: {}
    change_column_default :libraries, :name, from: nil, to: {}
    change_column_default :libraries, :description, from: nil, to: {}
    change_column_default :libraries, :url, from: nil, to: {}
    change_column_default :questions, :content, from: nil, to: {}
    change_column_default :tags, :display_name, from: nil, to: {}
  end
end
