# frozen_string_literal: true

# The Your data page (register 9b, A17): what Gala holds about the reader,
# why, who receives it and how long it is kept, and a download of all of it
# ({Readers::ExportAccount}). Signing in is enough to download: many accounts
# sign in through Google or a school's system and have no password to ask
# for again.
#
# A closed account can't reach this page (the sign-in gate sends it to the
# restore page). Its copy comes from a site admin, on the admin reader page.
class MyDataController < ApplicationController
  include SendsAccountExport

  before_action :authenticate_reader!
  # Getting a copy of your data can't be conditional on accepting new terms,
  # for the same reason closing an account isn't ({AccountClosuresController}).
  skip_before_action :confirm_tos

  # Each download reads every record the reader has; this keeps a stuck
  # button or a script from doing it hundreds of times.
  rate_limit to: 5, within: 1.hour, only: :download, by: -> { current_reader.id },
             with: -> { redirect_to my_data_path, alert: t('my_data.download.rate_limited') }

  layout 'window'

  # @route [GET] `/my_data`
  def show
    @counts = Readers::ExportAccount.new(current_reader).counts
  end

  # @route [GET] `/my_data/download`
  def download
    send_account_export current_reader
  end
end
