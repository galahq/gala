# frozen_string_literal: true

class Comment < ApplicationRecord
  include Authority::Abilities
  
  belongs_to :reader
  belongs_to :comment_thread, counter_cache: true, touch: true

  include Mobility
  translates :content, fallbacks: true

  default_scope { order :created_at }

  validates :content, presence: :true

  after_create { CommentBroadcastJob.perform_now self }
  after_create_commit { CommentThreadBroadcastJob.perform_later comment_thread }
  after_create_commit :send_notifications_of_reply

  delegate :forum, to: :comment_thread

  def timestamp
    I18n.l created_at.in_time_zone('America/Detroit'), format: :long
  end

  private

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
