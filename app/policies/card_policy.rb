# frozen_string_literal: true

# @see Card
class CardPolicy < ApplicationPolicy
  def create?
    user_can_update_case?
  end

  def update?
    user_can_update_case?
  end

  def destroy?
    return false unless record.siblings?
    user_can_update_case?
  end

  private

  def user_can_update_case?
    Pundit.policy(user, record.element.case).update?
  end
end
