class Enrollment < ApplicationRecord
  belongs_to :reader
  belongs_to :case
end
