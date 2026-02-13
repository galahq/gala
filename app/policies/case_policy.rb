# frozen_string_literal: true

# @see Case
class CasePolicy < ApplicationPolicy
  # What cases can this user see in the library?
  class Scope < Scope
    def resolve
      # Avoid plucking large ID arrays into Ruby; keep this as SQL subqueries.
      published = scope.published.select(:id).reorder(nil)
      my_cases = user.my_cases.select(:id).reorder(nil)
      enrolled = user.enrolled_cases.select(:id).reorder(nil)

      scope.where(id: published)
           .or(scope.where(id: my_cases))
           .or(scope.where(id: enrolled))
    end
  end

  # What cases can this user administrate?
  class AdminScope < Scope
    def resolve
      if editor?
        scope.all
      else
        my_cases = user.my_cases.select(:id).reorder(nil)
        managed = user.managed_cases.select(:id).reorder(nil)

        scope.where(id: my_cases)
             .or(scope.where(id: managed))
      end
    end
  end

  def show?
    record.published? ||
      user.my_cases.include?(record) ||
      user.enrollment_for_case(record).present? ||
      user.request_for_case(record).present? ||
      update? ||
      editor?
  end

  def update?
    return true if user_can_update_library?

    admin_scope.where(id: record.id).exists?
  end

  def stats?
    admin_scope.where(id: record.id).exists?
  end

  def destroy?
    return false if record.published?

    user.my_cases.include?(record) || update? || editor?
  end

  def admin_scope
    AdminScope.new(user, record.class).resolve
  end

  private

  def user_can_update_library?
    return false if record.library == SharedCasesLibrary.instance

    library_policy.update?
  end

  def library_policy
    LibraryPolicy.new(user, record.library)
  end
end
