class LinkedResource < ApplicationRecord
  CATEGORIES = %w[publication event teaching_resource other].freeze

  belongs_to :record, polymorphic: true, inverse_of: :linked_resources

  validates :record_type, presence: true
  validates :record_id, presence: true
  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :name, presence: true
  validates :url_or_doi, presence: true
  validates :description, length: { maximum: 160 }, allow_blank: true
end
