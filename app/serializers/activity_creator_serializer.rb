# frozen_string_literal: true

# @see ActivityCreator
class ActivityCreatorSerializer < ActiveModel::Serializer
  has_one :card
  has_one :edgenote
  has_one :page
end
