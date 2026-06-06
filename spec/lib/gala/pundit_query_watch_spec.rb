# frozen_string_literal: true

require 'rails_helper'

class PunditQueryWatchRecord; end

class PunditQueryWatchRecordPolicy
  def initialize(_user, _record); end

  def show?
    ActiveSupport::Notifications.instrument(
      'sql.active_record',
      sql: 'SELECT "cases".* FROM "cases" WHERE "cases"."id" = 1',
      name: 'Case Load'
    ) {}

    true
  end
end

RSpec.describe Gala::PunditQueryWatch do
  around do |example|
    previous_enabled = described_class.instance_variable_get(:@enabled)
    previous_max = described_class.instance_variable_get(:@max_queries)
    previous_repeat = described_class.instance_variable_get(:@repeat_threshold)

    described_class.enabled = true
    described_class.max_queries = 99
    described_class.repeat_threshold = 2
    Current.reset
    example.run
  ensure
    described_class.enabled = previous_enabled
    described_class.max_queries = previous_max
    described_class.repeat_threshold = previous_repeat
    Current.reset
  end

  it 'records SQL issued by direct Pundit policy predicates' do
    described_class.reset_request!

    Pundit.policy(AnonymousUser.new, PunditQueryWatchRecord.new).show?

    expect(Current.pundit_query_watch_events).to contain_exactly(
      hash_including(
        check: 'PunditQueryWatchRecordPolicy#show?',
        queries: [
          'SELECT "cases".* FROM "cases" WHERE "cases"."id" = ?'
        ]
      )
    )
  end

  it 'logs repeated authorization SQL fingerprints when the request flushes' do
    allow(Rails.logger).to receive(:warn)
    described_class.reset_request!

    2.times do
      Pundit.policy(AnonymousUser.new, PunditQueryWatchRecord.new).show?
    end
    described_class.flush_request!

    expect(Rails.logger).to have_received(:warn).with(
      a_string_including(
        '[pundit-query-watch] possible authorization N+1',
        'repeated_queries=2',
        'PunditQueryWatchRecordPolicy#show?'
      )
    )
  end
end
