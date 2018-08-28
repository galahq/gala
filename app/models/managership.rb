# frozen_string_literal: true

# A managership is the connection between a {Library} and a {Reader} who has the
# ability to edit it and to add cases to it. That Reader association is called
# {manager} for semantic clarity.
class Managership < ApplicationRecord
  attribute :manager_email, :string

  belongs_to :library
  belongs_to :manager, class_name: 'Reader'

  after_find :initialize_manager_email
  before_validation :set_manager_from_email, if: :manager_email_changed?

  delegate :name, to: :manager, prefix: true, allow_nil: true

  private

  def initialize_manager_email
    self.manager_email = manager&.email
  end

  def set_manager_from_email
    self.manager = Reader.find_by_email manager_email
  end
end
