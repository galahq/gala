# frozen_string_literal: true

# @see Case
class CasePolicy < ApplicationPolicy
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
      editor?
  end

  def update?
    admin_scope.where(id: record.id).exists?
  end

  def destroy?
    editor? unless record.published?
  end

  def admin_scope
    AdminScope.new(user, record.class).resolve
  end
end
