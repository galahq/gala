# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RepliesMailbox, type: :mailbox do
  it 'creates a new comment from the email contents' do
    reader = create :reader
    thread = create :comment_thread
    reader.enrollments.create case: thread.case

    receive_response 'Yeah I agree.', reader: reader, thread: thread

    comment = thread.comments.last
    expect(comment).to be_present
    expect(comment.reader).to eq reader
    expect(comment.content).to eq 'Yeah I agree.'
  end

  def receive_response(message, reader:, thread:)
    receive_inbound_email_from_mail(
      to: "reply+#{thread.key}@mailbox.learngala.com",
      from: reader.name_and_email,
      body: message
    )
  end
end
