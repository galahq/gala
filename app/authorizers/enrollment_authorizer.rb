class EnrollmentAuthorizer < ApplicationAuthorizer
  def self.updatable_by? user
    true
  end

  def updatable_by? user
    user_is_adding_or_removing_themself_as_a_student?(user) || user.has_role?(:editor)
  end

  def self.deletable_by? user
    true
  end

  def deletable_by? user
    resource.reader == user || super
  end

  private
  def user_is_adding_or_removing_themself_as_a_student?(user)
    resource.status ||= 'student'
    resource.case.published? && resource.reader == user && resource.student?
  end
end
