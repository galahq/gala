# frozen_string_literal: true

# @see Card
class CardPolicy < ElementPolicy
  def destroy?
    return false unless record.siblings?
    super
  end

  private

  def case
    record.element.case
  end
end
