# frozen_string_literal: true

# The join model for {Case}s and their polymorphic {Element}s. An instance of
# this model can be thought of as an entry in the case’s table of contents.
#
# @attr position [Numeric] the sequence of the element in the case’s table of
#   contents
class CaseElement < ApplicationRecord
  include Trackable

  belongs_to :case, inverse_of: :case_elements, touch: true
  belongs_to :element, dependent: :destroy,
                       inverse_of: :case_element, polymorphic: true

  acts_as_list scope: :case

  # The name of the corresponding {Ahoy::Event}s
  # @see Trackable#event_name
  def event_name
    'visit_element'
  end

  # The filter parameters used to find the corresponding {Ahoy::Event}s
  # @see Trackable#event_properties
  def event_properties
    { case_slug: self.case.slug,
      element_type: element_type,
      element_id: element_id }
  end
end
