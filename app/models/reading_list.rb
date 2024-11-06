# frozen_string_literal: true

# A collection of cases put together by a reader so she can share them together.
#
# @attr title [String]
# @attr description [String]
class ReadingList < ApplicationRecord
  attribute :uuid, :string, default: -> { SecureRandom.uuid }

  belongs_to :reader

  has_many :reading_list_saves, dependent: :destroy

  has_many :reading_list_items, -> { includes :case },
           inverse_of: :reading_list, dependent: :destroy
  has_many :cases, through: :reading_list_items

  has_one_attached :social_image

  validates :title, presence: true

  after_save :add_to_readers_saved_reading_lists

  accepts_nested_attributes_for :reading_list_items, allow_destroy: true

  alias items reading_list_items

  def to_param
    uuid
  end

  def case_slugs
    items.map(&:case).map(&:slug)
  end

  def saved_by?(reader)
    reading_list_saves.where(reader: reader).any?
  end

  def update_social_image
    ReadingListSocialImageCreationJob.perform_now self
  end

  private

  def add_to_readers_saved_reading_lists
    reader.saved_reading_lists << self unless saved_by?(reader)
  end
end
