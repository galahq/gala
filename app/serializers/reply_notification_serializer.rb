# frozen_string_literal: true

# @see ReplyNotification
class ReplyNotificationSerializer < ApplicationSerializer
  attributes :id, :message, :card_id, :comment_thread_id

  attribute(:community) do
    community = object.comment_thread.forum.community
    { id: community.id, name: community.name }
  end

  attribute(:notifier) do
    { id: object.notifier.id, name: object.notifier.name, initials: object.notifier.initials }
  end

  attribute(:case) do
    { slug: object.case.slug, kicker: object.case.kicker }
  end

  attribute :element, unless: -> { object.page.nil? } do
    { position: object.page.case_element.position }
  end
end
