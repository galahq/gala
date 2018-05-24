# frozen_string_literal: true

# @see Case
class CasePolicy < ApplicationPolicy
  # What cases can this user see in the library?
  class Scope < Scope
    def resolve
      scope.where id: scope.published.pluck(:id) +
                      user.my_cases.pluck(:id) +
                      user.enrolled_cases.pluck(:id)
    end
  end

  # What cases can this user administrate?
  class AdminScope < Scope
    def resolve
      if editor?
        scope.all
      else
        scope.merge(user.my_cases)
      end
    end
  end

  def show?
    record.published? ||
      user.enrollment_for_case(record).present? ||
      user.my_cases.include?(record) ||
      editor?
  end

  def update?
    return false unless admin_scope.where(id: record.id).exists?
    user_can_update_library?
  end

  def destroy?
    return false if record.published?
    user.my_cases.include?(record) || editor?
  end

  def admin_scope
    AdminScope.new(user, record.class).resolve
  end

  private

  def user_can_update_library?
    return true unless record.library.persisted?
    library_policy.update?
  end

  def library_policy
    LibraryPolicy.new(user, record.library)
  end
end
