# frozen_string_literal: true

# The one email a closed reader gets: sent once, at the moment of closing,
# with the deletion date and how to restore (grace-state rule W6). There is no
# reminder before day 30.
class AccountClosureMailer < ApplicationMailer
  def closed(deletion_request)
    @deletion_request = deletion_request
    @reader = deletion_request.reader
    # The account is already closed, so name says "Deleted user".
    @name = @reader.stored_name

    mail(
      to: email_address_with_name(@reader.email, @name.presence),
      subject: t('.subject')
    ) do |format|
      format.text
      format.html
    end
  end
end
