# frozen_string_literal: true

module Element
  extend ActiveSupport::Concern

  included do
    has_one :case_element, as: :element, dependent: :destroy
  end

  module ClassMethods
    def create_as_element(kase, params)
      instance = new(params)
      instance.case = kase
      kase.case_elements.create(element: instance) if instance.save
      instance
    end
  end
end
