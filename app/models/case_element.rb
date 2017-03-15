class CaseElement < ApplicationRecord
  belongs_to :case
  belongs_to :element, polymorphic: true
  acts_as_list scope: :case

  def element_details
    "#{element_type.tableize}/#{element_id}"
  end
end
