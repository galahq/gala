# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RepliesMailbox, type: :mailbox do
  it 'creates a new comment from the email contents' do
    reader = create :reader
    thread = create :comment_thread
    deployment = create :deployment, case: thread.case
    reader.enrollments.create case: thread.case

    receive_response 'Yeah I agree.', reader: reader, thread: thread

    comment = thread.comments.last
    expect(comment).to be_present
    expect(comment.reader).to eq reader
    expect(comment.content).to eq 'Yeah I agree.'
  end

  it 'trims signatures and quoted text from the reply notification' do
    reader = create :reader
    thread = create :comment_thread
    reader.enrollments.create case: thread.case

    receive_response <<~EMAIL, reader: reader, thread: thread
      Yeah I agree.

      > On Mar 20, 2019, at 12:00, Pearl Zhu Zeng <hello@learngala.com> wrote:
      >
      > This is cool.
    EMAIL

    comment = thread.comments.last
    expect(comment.content).to eq 'Yeah I agree.'

    receive_response <<~EMAIL, reader: reader, thread: thread
      Yeah I agree.

      -- CLB
    EMAIL

    comment = thread.comments.last
    expect(comment.content).to eq 'Yeah I agree.'
  end

  it 'does not post a comment by a reader who’s not allowed' do
    reader = create :reader
    thread = create :comment_thread

    receive_response <<~EMAIL, reader: reader, thread: thread
      Yeah I agree.

      > On Mar 20, 2019, at 12:00, Pearl Zhu Zeng <hello@learngala.com> wrote:
      >
      > This is cool.
    EMAIL

    comment = thread.comments.last
    expect(comment).not_to be_present
  end

  def receive_response(message, reader:, thread:)
    receive_inbound_email_from_mail(
      to: "reply+#{thread.key}@mailbox.learngala.com",
      from: reader.name_and_email,
      body: message
    )
  end
end
