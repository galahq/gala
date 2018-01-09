# frozen_string_literal: true

# @see Enrollment
class EnrollmentAuthorizer < ApplicationAuthorizer
  # Readers can add only themselves only as students
  def creatable_by?(user)
    user_is_adding_or_removing_themself_as_a_student?(user) ||
      super
  end

  # Readers can only unenroll themselves
  def deletable_by?(user)
    resource.reader == user || super
  end

  private

  # Gotta love that singular they
  def user_is_adding_or_removing_themself_as_a_student?(user)
    resource.status ||= 'student'
    resource.case.published? && resource.reader == user && resource.student?
  end
end
