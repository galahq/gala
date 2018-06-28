# frozen_string_literal: true

# Cases can be tagged with categories and keywords
module Taggable
  extend ActiveSupport::Concern

  included do
    has_many :taggings, dependent: :destroy
    has_many :tags, through: :taggings
  end

  module ClassMethods
    def tagged(tag_name)
      joins(taggings: :tag).where(taggings: { tags: { name: tag_name } })
    end
  end

  def tagged?(name)
    tagging_for_tag_named(name).present?
  end

  def tag(name)
    Tagging.with_tag_named(name).tap { |t| taggings << t }
  rescue ActiveRecord::RecordNotUnique
    tagging_for_tag_named name
  end

  def untag(name)
    tagging_for_tag_named(name)&.destroy
  end

  private

  def tagging_for_tag_named(name)
    taggings.joins(:tag).find_by(tags: { name: name })
  end
end
