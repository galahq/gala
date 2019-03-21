# frozen_string_literal: true

# Users can post comments by replying to notifications they receive about
# comments others have posted in threads they’re participating in.
class RepliesMailbox < ApplicationMailbox
  # @route [reply+thread-key@mailbox.learngala.com]
  def process
    Comment.create!(reader: reader, comment_thread: thread, content: content)
  end

  private

  def thread
    key = mail.to.first.match(/reply\+(?<key>.+)@/)[:key]
    CommentThread.find_by! key: key
  end

  def reader
    Reader.find_by! email: mail.from.first
  end

  def content
    if mail.multipart?
      mail.text_part
    else
      mail.decoded
    end
  end
end
