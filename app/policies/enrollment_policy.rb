# frozen_string_literal: true

# @see Enrollment
class EnrollmentPolicy < ApplicationPolicy
  def create?
    (user == record.reader && record.student?) || editor?
  end

  def destroy?
    user == record.reader || editor?
  end
end
