# frozen_string_literal: true

# A reader closing their own account (register A22). One page explains what
# is hidden now, what is erased after 30 days and what is kept, warns
# instructors about their classes (A23), and asks for the reader's email
# address to confirm. Closing signs them out and emails them the deletion
# date and how to restore.
#
# A closed reader never reaches this controller: the sign-in gate sends them
# to the restore page first (grace-state rule W4).
class AccountClosuresController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_class_count

  layout 'window'

  # @route [GET] `/account_closure/new`
  def new; end

  # @route [POST] `/account_closure`
  def create
    unless email_confirmed?
      @email_mismatch = true
      return render :new, status: :unprocessable_entity
    end

    close_and_sign_out
    redirect_to root_path, notice: t('.closed')
  end

  private

  # A class's only instructor is the reader who created it, so once they close
  # their account nobody can see its roster or quiz results (A23).
  def set_class_count
    @class_count = current_reader.deployments
                                 .merge(GroupMembership.admin)
                                 .distinct.count
  end

  def email_confirmed?
    params[:email].to_s.strip.casecmp?(current_reader.email)
  end

  def close_and_sign_out
    reader = current_reader
    close_and_email(reader)
    sign_out reader
  end

  # A double-submit finds the account already closed: the first request has
  # sent the email, so this one only signs out.
  def close_and_email(reader)
    request = Readers::CloseAccount.call(reader)
    AccountClosureMailer.closed(request).deliver_later
  rescue Readers::CloseAccount::AlreadyClosed
    nil
  end
end
