# frozen_string_literal: true

# One single part of a case that appears in the table of contents. It defines
# the polymorphic relationship with an Element in the models that include it.
module Element
  extend ActiveSupport::Concern

  included do
    has_one :case_element, as: :element, dependent: :destroy, required: true

    after_save -> { case_element.touch }
  end

  # @return [Case]
  def case
    case_element.case
  end
end
