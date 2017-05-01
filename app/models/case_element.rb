class CaseElement < ApplicationRecord
  belongs_to :case
  belongs_to :element, polymorphic: true
  acts_as_list scope: :case

  def element_details
    "#{element_type.tableize}/#{element_id}"
  end

  include Trackable
  def event_name
    'visit_element'
  end

  def event_properties
    {case_slug: this.case.slug, element_type: element_type, element_id: element_id}
  end
end
