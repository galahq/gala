# frozen_string_literal: true

# @see Tag
class TagSerializer < ApplicationSerializer
  attributes :name, :display_name, :category
end
