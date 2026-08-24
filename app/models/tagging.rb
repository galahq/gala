# frozen_string_literal: true

# This is the join model between {Case}s and {Tag}s
class Tagging < ApplicationRecord
  # touch keeps the case's cache keys honest: tag changes must rotate the
  # cached catalog and case-show payloads.
  belongs_to :case, touch: true
  belongs_to :tag, counter_cache: true

  def self.with_tag_named(name)
    new tag: Tag.get(name)
  end
end
