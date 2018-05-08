# frozen_string_literal: true

# @see CaseElement
class CaseElementSerializer < ApplicationSerializer
  attributes :id, :case_id, :element_id, :element_type, :position
  attribute(:element_store) { "#{object.element_type.tableize}ById" }
end
