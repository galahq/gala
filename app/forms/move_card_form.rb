# frozen_string_literal: true

# For validating updates to {Card}s
class UpdateCardForm
  include ActiveModel::Model

  attr_accessor :card

  validate :new_element_is_page_in_case?

  def save
    return unless valid? && card.valid?

    card.save
  end

  private

  def new_element_is_page_in_case?
    return unless card.element_changed?
    return unless card.element.is_a?(Page) && card.element.case == card.case

    errors.add :card, 'can only be moved to a Page in the same Case'
  end
end
