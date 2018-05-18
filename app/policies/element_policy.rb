# frozen_string_literal: true

# Elements are creatable, updatable, and destroyable by anyone who can update
# their case
class ElementPolicy < ApplicationPolicy
  def create?
    user_can_update_case?
  end

  def update?
    user_can_update_case?
  end

  def destroy?
    user_can_update_case?
  end

  private

  def user_can_update_case?
    Pundit.policy(user, send(:case)).update?
  end

  def case
    record.case
  end
end
