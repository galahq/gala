# frozen_string_literal: true

require 'rails_helper'

# For a site admin `CasePolicy::AdminScope` returns every case on the site, and
# the index renders a "First Editor" column for them. `Editorship` delegates
# `editor_name` to its editor, so without a preload the column costs a query
# per row. Measured on production 2026-11-09: 1,531 cases, 6.3 seconds before
# the first byte.
RSpec.describe 'My cases, as a site admin' do
  let(:admin) { create :reader, :editor }

  def sql_during
    statements = []
    subscriber = ActiveSupport::Notifications.subscribe('sql.active_record') do |*args|
      payload = args.last
      statements << payload[:sql] unless payload[:name].to_s.match?(/SCHEMA|TRANSACTION/)
    end
    yield
    statements
  ensure
    ActiveSupport::Notifications.unsubscribe(subscriber)
  end

  def case_with_an_editor(name = nil)
    kase = create :case
    Editorship.create! case: kase, editor: create(:reader, name: name || 'Someone')
    kase
  end

  it 'names the first editor of each case' do
    case_with_an_editor 'Robin Author'
    sign_in admin

    get my_cases_path

    expect(response).to have_http_status :ok
    expect(response.body).to include 'Robin Author'
  end

  it 'asks whether the viewer is a site admin once, not once per case' do
    sign_in admin
    6.times { case_with_an_editor }

    statements = sql_during { get my_cases_path }

    # The column each row renders depends on `current_reader.has_role? :editor`,
    # and rolify goes to the database every time it is asked. Measured before
    # hoisting the call out of the loop: nine of these for six cases.
    expect(statements.count { |s| s.include?('FROM "roles"') }).to be <= 5
  end

  it 'reads the editorships in one query however many cases there are' do
    sign_in admin
    6.times { case_with_an_editor }

    statements = sql_during { get my_cases_path }

    # One preload, not one per row. Without `includes(editorships: :editor)`
    # this is six.
    expect(statements.count { |s| s.include?('FROM "editorships"') }).to be <= 2
  end
end
