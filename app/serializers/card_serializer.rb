# frozen_string_literal: true

# @see Card
class CardSerializer < ApplicationSerializer
  attributes :id, :page_id, :position, :solid, :raw_content
end
