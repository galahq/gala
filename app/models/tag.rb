# frozen_string_literal: true

# A searchable/browsable keyword for a case. Category tags are highlighted with
# a picture and non-category “keyword” tags are not.
#
# @attr category [Boolean] whether the tag is a “category”
# @attr name [Translated<String>] the contents of the tag
class Tag < ApplicationRecord
  include Mobility

  translates :display_name, fallbacks: true

  has_many :taggings, dependent: :restrict_with_exception
  has_many :cases, through: :taggings

  before_validation :ensure_english_display_name_matches_name

  def self.get(name)
    create name: name
  rescue ::ActiveRecord::RecordNotUnique
    find_by! name: name
  end

  def to_s
    return display_name unless category
    "category:#{display_name}"
  end

  private

  def ensure_english_display_name_matches_name
    Mobility.with_locale :en do
      self.display_name = name
    end
  end
end
