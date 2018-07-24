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
  before_validation -> { display_name.downcase! }

  # The most popular tags, as well as all the categories, are shown on the
  # catalog page
  scope :most_popular, -> do
    order(category: :desc, taggings_count: :desc).limit(50)
  end

  # Tags should only be included in the catalog if they are assigned to at least
  # one public case
  scope :part_of_catalog, -> do
    where id: (
      joins(Arel.sql(<<~SQL.squish))
        INNER JOIN taggings ON tags.id = taggings.tag_id
        INNER JOIN cases
          ON taggings.case_id = cases.id AND cases.published_at < NOW()
      SQL
      .limit(false) # If the consumer has limited before this scope, it breaks
      .pluck(:id) + where(category: true).limit(false).pluck(:id)
    )
  end

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
