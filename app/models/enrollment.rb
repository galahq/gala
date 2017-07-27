# frozen_string_literal: true

class Enrollment < ApplicationRecord
  include Authority::Abilities

  belongs_to :reader
  belongs_to :case

  belongs_to :active_group, class_name: 'Group'

  enum status: %i[student instructor treatment]

  def self.upsert(case_id:, reader_id:, active_group_id: nil, status: :student)
    enrollment = find_or_initialize_by(case_id: case_id, reader_id: reader_id)
    enrollment.active_group_id = active_group_id
    enrollment.status = status if status
    enrollment.save! if enrollment.changed?
    enrollment
  end

  # Ratio of elements used to total number of elements: a measurement of how
  # thoroughly a student has engaged with the case.
  def case_completion
    elements_used = self.case.events.where(name: 'visit_element')
                        .merge(reader.events)
                        .distinct
                        .pluck("ahoy_events.properties ->> 'element_id'",
                               "ahoy_events.properties ->> 'element_type'")
                        .count
    elements_used.to_f / self.case.case_elements.count
  end

  def as_json(options = {})
    super(options.merge(include: [reader: {
                          only: %i[id image_url initials name]
                        }]))
  end
end
