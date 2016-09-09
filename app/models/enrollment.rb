class Enrollment < ApplicationRecord
  include Authority::Abilities

  belongs_to :reader
  belongs_to :case

  enum status: %i(student instructor)
end
