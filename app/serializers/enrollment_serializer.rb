# frozen_string_literal: true

# @see Enrollment
class EnrollmentSerializer < ApplicationSerializer
  attributes :id, :status
  attribute(:case_slug) { object.case.slug }
end
