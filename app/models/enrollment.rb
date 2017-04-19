class Enrollment < ApplicationRecord
  include Authority::Abilities

  belongs_to :reader
  belongs_to :case

  enum status: %i(student instructor treatment)

  def self.upsert case_id:, reader_id:, status: student
    enrollment = find_or_initialize_by( case_id: case_id, reader_id: reader_id )
    enrollment.status = status
    enrollment.save! if enrollment.changed?
    enrollment
  end

  def self.status_from_lti_role ext_roles
    if ext_roles.match 'urn:lti:role:ims/lis/Instructor'
      :instructor
    else
      :student
    end
  end

  def as_json(options = {})
    super(options.merge({include: [reader: { only: %i(id image_url initials name) }]}))
  end
end
