# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :reader, :user, :pundit_query_watch_events,
            :pundit_query_watch_request
end
