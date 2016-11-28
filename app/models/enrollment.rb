class Enrollment < ApplicationRecord
  include Authority::Abilities

  belongs_to :reader
  belongs_to :case

  enum status: %i(student instructor treatment)

  def self.upsert(case_id:, reader_id:, status:)
    enrollment = find_or_initialize_by( case_id: case_id, reader_id: reader_id )
    enrollment.status = statuses[status]
    enrollment.save!
    enrollment
  end

  def as_json(options = {})
    super(options.merge({include: [reader: { only: %i(id image_url initials name) }]}))
  end
end
