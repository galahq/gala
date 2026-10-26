# frozen_string_literal: true

# @see LinkedResource
class LinkedResourceSerializer < ApplicationSerializer
  attributes :id, :name, :identifiers, :connection, :connection_other,
             :description, :position
end
