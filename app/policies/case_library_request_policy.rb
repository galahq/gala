# frozen_string_literal: true

# @see CaseLibraryRequest
class CaseLibraryRequestPolicy < ApplicationPolicy
  # What requests can this user see?
  class Scope < Scope
    def resolve
      if editor?
        scope.all
      else
        scope.where library_id: user.libraries.pluck(:id)
      end
    end
  end

  def update?
    case_policy.show? || editor?
  end

  def destroy?
    case_policy.update? || editor?
  end

  def case_policy
    CasePolicy.new(user, record.case)
  end
end
