# frozen_string_literal: true

class RuntimeStatsSerializer < ApplicationSerializer
  attributes :captured_at,
             :environment,
             :process,
             :gc,
             :heap,
             :objects,
             :caches,
             :redis,
             :postgres,
             :sidekiq,
             :action_cable,
             :warnings
end

