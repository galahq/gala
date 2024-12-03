# frozen_string_literal: true

# A reader’s response to the case
#
# @attr content [String] markdown formatted content
class Comment < ApplicationRecord
  include Mobility

  default_scope { order :created_at }

  alias_attribute :timestamp, :created_at
  translates :content, fallbacks: true

  belongs_to :reader
  belongs_to :comment_thread, counter_cache: true, touch: true

  has_many_attached :attachments

  has_one :forum, through: :comment_thread
  has_one :case, through: :forum
  has_one :community, through: :forum

  validates :content, presence: true

  after_save { CommentBroadcastJob.perform_now self }
  after_create_commit { CommentThreadBroadcastJob.perform_later comment_thread }
  after_create_commit :send_notifications_of_reply

  def edited?
    updated_at - created_at > 1.minute
  end

  private

  # Send a notification over ActionCable to participants in the thread other
  # than the respondant
  def send_notifications_of_reply
    card = comment_thread.card
    comment_thread.collocutors.each do |other_reader|
      next if other_reader == reader

      ReplyNotification.create reader: other_reader,
                               notifier: reader,
                               comment: self,
                               comment_thread: comment_thread,
                               card: card,
                               case: forum.case,
                               page: card&.element
    end
  end
end
