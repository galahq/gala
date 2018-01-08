# frozen_string_literal: true

# A reader’s response to the case
#
# @attr content [RawDraftContentState]
class Comment < ApplicationRecord
  include Authority::Abilities
  include Mobility

  default_scope { order :created_at }

  alias_attribute :timestamp, :created_at
  translates :content, fallbacks: true

  belongs_to :reader
  belongs_to :comment_thread, counter_cache: true, touch: true

  validates :content, presence: true

  after_create { CommentBroadcastJob.perform_now self }
  after_create_commit { CommentThreadBroadcastJob.perform_later comment_thread }
  after_create_commit :send_notifications_of_reply

  delegate :forum, to: :comment_thread

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
                               case: card.case,
                               page: card.element
    end
  end
end
