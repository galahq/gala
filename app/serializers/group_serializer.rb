# frozen_string_literal: true

# @see Group
class GroupSerializer < ApplicationSerializer
  attributes :id, :name
  has_many :readers
end
