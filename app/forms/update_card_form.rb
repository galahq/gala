# frozen_string_literal: true

# For validating updates to {Card}s
class UpdateCardForm
  include ActiveModel::Model

  attr_accessor :card, :position, :solid, :raw_content, :page_id

  validates :card, presence: true
  validate :new_element_is_page_in_case?

  def save
    card.assign_attributes card_params

    return unless valid?

    card.save!
    true
  end

  private

  def new_element_is_page_in_case?
    return unless page.present?
    return if page.case == card.case

    errors.add :card, 'can only be moved to a Page in the same Case'
  end

  def page
    @page ||= Page.find page_id
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def card_params
    {
      position: position,
      solid: solid,
      raw_content: raw_content,
      element: page
    }.compact
  end
end
