# frozen_string_literal: true

# When a reader tries to update a lockable model, we check that the model is not
# locked by someone else.
module VerifyLock
  extend ActiveSupport::Concern

  private

  def verify_lock_on(model)
    return if !model.locked? || model.locked_by?(current_user)
    render json: model, status: :locked
  end
end
