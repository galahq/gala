# frozen_string_literal: true

# @see LibraryRequestMailer
class LibraryRequestMailer < ApplicationMailer

  def notify(request, manager)
    @request = request
    @manager = manager

    attach_cover_image

    send_mail do |format|
      format.text
      format.html
    end
  end

  private

  def reader
    @manager
  end

  def attach_cover_image
    return unless @request.case.cover_image.attached?

    kase = CaseDecorator.decorate @request.case
    attachments.inline['cover'] = kase.cover_image_attachment
  end

  def send_mail(&block)
    mail(
      to: reader.name_and_email,
      from: from_header,
      reply_to: reply_to_header,
      subject: subject_header,
      &block
    )
  end

  # Build the from header. We’re setting the from name to the name of the
  # reader whose request triggered the notification, but the from address
  # remains our notification address so as not to trip spam filters
  def from_header
    "#{@request.requester.name} <#{ApplicationMailer::FROM_ADDRESS}>"
  end

  # Build the email subject as follows
  # Michigan Sustainable Studies has a new Library Request
  #
  # Every notification of a reply to the same original request will have the
  # same subject so that they can be threaded
  def subject_header
    "#{@request.library.name} has a new Library Request"
  end

  def reply_to_header
    "reply+#{@request.library.slug}@mailbox.learngala.com"
  end

end
