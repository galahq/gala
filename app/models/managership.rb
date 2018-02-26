# frozen_string_literal: true

# A managership is the connection between a {Library} and a {Reader} who has the
# ability to edit it and to add cases to it. That Reader association is called
# {manager} for semantic clarity.
class Managership < ApplicationRecord
  belongs_to :library
  belongs_to :manager, class_name: 'Reader'
end
