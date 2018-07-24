# frozen_string_literal: true

# This is the join model between {Case}s and {Tag}s
class Tagging < ApplicationRecord
  belongs_to :case
  belongs_to :tag, counter_cache: true

  def self.with_tag_named(name)
    new tag: Tag.get(name)
  end
end
