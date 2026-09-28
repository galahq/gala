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

    it 'leaves ordinary parameters alone' do
      filtered = filter.filter('name' => 'Reader Name', 'locale' => 'en')

      expect(filtered).to eq('name' => 'Reader Name', 'locale' => 'en')
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

    it 'does not attach request parameters' do
      sign_in reader
      get root_path, params: { probe: 'value' }

      expect(scope).to have_received(:set_extras).with(url: a_string_including('probe=value'))
      expect(scope).not_to have_received(:set_extras).with(hash_including(:params))
    end

    it 'sets no user when nobody is signed in' do
      get root_path

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
        '/readers/sign_in',
        method: 'POST',
        params: { reader: { email: 'someone@example.com', password: 'hunter2' } },
        'REMOTE_ADDR' => '203.0.113.7',
        'HTTP_COOKIE' => '_gala_session=session-secret'
      )
    end

    it 'does not carry the sign-in form body, cookies or client IP' do
      event = Sentry::ErrorEvent.new(configuration: configuration)
      event.rack_env = sign_in_env

      payload = event.to_hash.to_json

      expect(payload).to include('/readers/sign_in')
      expect(payload).not_to include('someone@example.com')
      expect(payload).not_to include('hunter2')
      expect(payload).not_to include('203.0.113.7')
      expect(payload).not_to include('session-secret')
    end
  end
end
