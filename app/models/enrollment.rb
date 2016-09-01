class Enrollment < ApplicationRecord
  belongs_to :reader
  belongs_to :case

  enum status: %i(student reviewer)
end
