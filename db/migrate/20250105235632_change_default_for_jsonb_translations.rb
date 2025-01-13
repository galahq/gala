# frozen_string_literal: true

# This migration changes the default value of the translated columns from nil to an empty hash
# fixes compatibility issues with mobility 1.3.x
class ChangeDefaultForJsonbTranslations < ActiveRecord::Migration[7.0]
  def self.nil_to_hash # rubocop:disable Metrics/AbcSize
    Comment.where(content: nil).update_all(content: {})
    Community.where(name: nil).update_all(name: {})
    Community.where(description: nil).update_all(description: {})
    Group.where(name: nil).update_all(name: {})
    Library.where(name: nil).update_all(name: {})
    Library.where(description: nil).update_all(description: {})
    Library.where(url: nil).update_all(url: {})
    Question.where(content: nil).update_all(content: {})
    Tag.where(display_name: nil).update_all(display_name: {})
  end

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

    self.class.nil_to_hash
  end
end
