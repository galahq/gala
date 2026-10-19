# frozen_string_literal: true

# Where a closed reader lands, on every request, until they restore the
# account or sign out (grace-state rules W4 and W5). Signing in works by every
# route so they can prove who they are; restoring takes an explicit click here.
# Restoring on sign-in alone would be wrong: an LTI launch signs readers in
# automatically, so a course link would undo a closure the reader asked for.
class AccountRestorationsController < ApplicationController
  before_action :authenticate_reader!
  skip_before_action :confirm_tos
  before_action :require_closed_reader

  layout 'window'

  # @route [GET] `/account_restoration`
  def show
    @deletion_request = current_reader.pending_account_deletion_request
    # Devise's "Signed in successfully." and "You are already signed in."
    # both contradict this page, and nothing else sends a message here.
    flash.delete(:notice)
    flash.delete(:alert)
  end

  # @route [POST] `/account_restoration`
  def create
    Readers::RestoreAccount.call(current_reader)
    redirect_to root_path, notice: t('.restored')
  rescue Readers::RestoreAccount::NotRestorable
    redirect_to account_restoration_path
  end

  private

  def require_closed_reader
    redirect_to root_path unless current_reader.closed?
  end
end
