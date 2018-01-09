# frozen_string_literal: true

# One single part of a case that appears in the table of contents. It defines
# the polymorphic relationship with an Element in the models that include it.
module Element
  extend ActiveSupport::Concern

  included do
    has_one :case_element, as: :element, dependent: :destroy
  end

  class_methods do
    # Create a new instance of the Element and the corresponding CaseElement
    # instance to connect it to the given case
    def create_as_element(kase, params)
      instance = new(params)
      instance.case = kase
      kase.case_elements.create(element: instance) if instance.save
      instance
    end
  end
end
