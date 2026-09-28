# frozen_string_literal: true

require 'rails_helper'

# Personal data used to reach places no deletion workflow can touch: the
# application logs (filter_parameters was [:password] only, while lograge logs
# every other parameter) and Sentry (the user's email attached to every event
# by both the Ruby and browser SDKs, the raw parameter hash as an extra, and
# with send_default_pii on, the raw form body, cookies and IP on every event).
# These specs make a regression loud, because nothing else would — emails
# would just quietly start flowing again.
RSpec.describe 'PII in logs and error monitoring' do
  describe 'parameter filtering' do
    let(:filter) { ActiveSupport::ParameterFilter.new(Rails.application.config.filter_parameters) }

    it 'redacts email addresses, tokens and passwords from logged params' do
      filtered = filter.filter(
        'email' => 'someone@example.com',
        'unconfirmed_email' => 'new@example.com',
        'password' => 'hunter2',
        'password_confirmation' => 'hunter2',
        'confirmation_token' => 'abc123',
        'authentication_token' => 'xyz789'
      )

      expect(filtered.values).to all(eq('[FILTERED]'))
    end

    it 'redacts the forum comment body without touching other content keys' do
      filtered = filter.filter(
        'comment' => { 'content' => 'I live at 123 Main St', 'attachments' => [] },
        'content_type' => 'text/html'
      )

      expect(filtered['comment']['content']).to eq('[FILTERED]')
      expect(filtered['content_type']).to eq('text/html')
    end

    it 'redacts quiz answer text and LTI person fields' do
      filtered = filter.filter(
        'submission' => { 'answers' => [{ 'question_id' => 1, 'content' => 'my answer' }] },
        'lis_person_name_full' => 'Reader Name',
        'lis_person_sourcedid' => 'school:123'
      )

      expect(filtered['submission']['answers'].first).to eq('question_id' => 1, 'content' => '[FILTERED]')
      expect(filtered['lis_person_name_full']).to eq('[FILTERED]')
      expect(filtered['lis_person_sourcedid']).to eq('[FILTERED]')
    end

    it 'redacts the reader name and initials from the registration form' do
      filtered = filter.filter('reader' => { 'name' => 'Reader Name', 'initials' => 'RN', 'locale' => 'en' })

      expect(filtered['reader']).to eq('name' => '[FILTERED]', 'initials' => '[FILTERED]', 'locale' => 'en')
    end

    it 'redacts the magic-link key but not other key-like parameters' do
      filtered = filter.filter('key' => 'enrol-me', 'keyword' => 'sustainability')

      expect(filtered).to eq('key' => '[FILTERED]', 'keyword' => 'sustainability')
    end

    it 'leaves ordinary parameters alone' do
      filtered = filter.filter('name' => 'Case Name', 'locale' => 'en')

      expect(filtered).to eq('name' => 'Case Name', 'locale' => 'en')
    end
  end

  describe 'Sentry scope' do
    let(:reader) { create(:reader) }
    let(:scope) { instance_double(Sentry::Scope, set_user: nil, set_extras: nil) }

    before do
      allow(Sentry).to receive(:configure_scope).and_yield(scope)
    end

    it 'identifies a signed-in reader by id, never by email' do
      sign_in reader
      get root_path

      expect(scope).to have_received(:set_user).with(id: reader.id)
      expect(scope).not_to have_received(:set_user).with(hash_including(:email))
    end

    it 'attaches neither the parameters nor the URL' do
      sign_in reader
      get root_path, params: { probe: 'value' }

      expect(scope).not_to have_received(:set_extras)
    end

    it 'sets no user when nobody is signed in' do
      get root_path

      expect(scope).not_to have_received(:set_user)
    end

    # The context runs on Devise actions too, and Devise puts one-time
    # credentials in the query string of the links it emails.
    it 'attaches nothing on a password-reset link' do
      get edit_reader_password_path, params: { reset_password_token: 'RAWTOKEN123' }

      expect(scope).not_to have_received(:set_extras)
      expect(scope).not_to have_received(:set_user)
    end
  end

  # The scope specs above protect the controller. This one protects the
  # configuration: it builds a real event through the SDK using the production
  # settings, so a future `send_default_pii = true` fails here rather than in
  # Sentry's UI.
  describe 'Sentry event payload under the production configuration' do
    let(:configuration) do
      config = Sentry::Configuration.new
      # The initializer returns early outside production and staging. Load it
      # under a production env and capture the block instead of initialising.
      allow(Rails).to receive(:env)
        .and_return(ActiveSupport::EnvironmentInquirer.new('production'))
      allow(Sentry).to receive(:init).and_yield(config)
      load Rails.root.join('config', 'initializers', 'sentry.rb')
      config
    end

    let(:sign_in_env) do
      Rack::MockRequest.env_for(
        '/readers/sign_in?reset_password_token=QUERYTOKEN',
        method: 'POST',
        params: { reader: { email: 'someone@example.com', password: 'hunter2' } },
        'REMOTE_ADDR' => '203.0.113.7',
        'HTTP_COOKIE' => '_gala_session=session-secret',
        'HTTP_REFERER' => 'http://example.org/readers/password/edit?reset_password_token=REFERERTOKEN'
      )
    end

    it 'does not carry the form body, cookies, client IP or any query-string token' do
      event = Sentry::ErrorEvent.new(configuration: configuration)
      event.rack_env = sign_in_env
      event = configuration.before_send.call(event, {})

      payload = event.to_hash.to_json

      # A bare Configuration already has send_default_pii off, so prove the
      # initializer's block actually ran or this example is vacuous.
      expect(Sentry).to have_received(:init)
      expect(configuration.enabled_environments).to eq(%w[production staging])
      expect(payload).to include('/readers/sign_in')
      expect(payload).to include('/readers/password/edit')
      expect(payload).not_to include('someone@example.com')
      expect(payload).not_to include('hunter2')
      expect(payload).not_to include('203.0.113.7')
      expect(payload).not_to include('session-secret')
      expect(payload).not_to include('QUERYTOKEN')
      expect(payload).not_to include('REFERERTOKEN')
    end

    it 'does not ship SQL statements to Sentry Logs' do
      expect(configuration.rails.structured_logging.subscribers.keys).to eq [:action_controller]
    end
  end
end
