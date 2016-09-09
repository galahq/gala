class Enrollment < ApplicationRecord
  include Authority::Abilities

  belongs_to :reader
  belongs_to :case

  enum status: %i(student instructor)

  def as_json(options = {})
    super(options.merge({include: [reader: { only: %i(id image_url initials name) }]}))
  end
end
