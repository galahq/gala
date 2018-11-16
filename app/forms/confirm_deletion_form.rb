# frozen_string_literal: true

# We require the user to type their case’s kicker to confirm their intent to
# delete it
class ConfirmDeletionForm
  include ActiveModel::Model

  attr_accessor :case, :kicker_confirmation

  validate :kicker_confirmed?, if: :needs_confirmation?

  def needs_confirmation?
    self.case.kicker.present?
  end

  def save
    return unless valid?

    delete_case
    true
  end

  private

  def kicker_confirmed?
    return if kicker_confirmation == self.case.kicker

    errors.add :kicker_confirmation, :match
  end

  def delete_case
    self.case.destroy
  end
end
