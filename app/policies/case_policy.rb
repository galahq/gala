# frozen_string_literal: true

# @see Case
class CasePolicy < ApplicationPolicy
  def show?
    record.published? ||
      user.enrollment_for_case(record).present? ||
      editor?
  end

  def destroy?
    editor? unless record.published?
  end
end
