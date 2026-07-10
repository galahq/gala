# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GoogleOauthSetup do
  let(:strategy_class) { Struct.new(:options) }
  let(:legacy_id) { 'fake-legacy-client-id' }
  let(:legacy_secret) { 'fake-legacy-client-secret' }
  let(:migration_id) { 'fake-migration-client-id' }
  let(:migration_secret) { 'fake-migration-client-secret' }
  let(:session) { {} }

  before do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('GOOGLE_CLIENT_ID').and_return(legacy_id)
    allow(ENV).to receive(:[]).with('GOOGLE_CLIENT_SECRET')
                              .and_return(legacy_secret)
    allow(ENV).to receive(:[]).with('GOOGLE_MIGRATION_CLIENT_ID')
                              .and_return(migration_id)
    allow(ENV).to receive(:[]).with('GOOGLE_MIGRATION_CLIENT_SECRET')
                              .and_return(migration_secret)
  end

  describe 'authorization setup' do
    it 'selects migration credentials for an existing allowlisted Reader' do
      create :reader, email: 'nathan.papes@gmail.com'

      env, options = authorization_env(' NATHAN.PAPES@GMAIL.COM ')
      described_class.call(env)

      expect(options).to include(client_id: migration_id,
                                 client_secret: migration_secret)
      expect(session['gala.google_oauth_client_selection']).to eq('migration')
    end

    it 'selects legacy credentials for a blank email' do
      expect_legacy_authorization('  ')
    end

    it 'selects legacy credentials for an unknown email' do
      expect_legacy_authorization('unknown@example.com')
    end

    it 'selects legacy credentials for an existing non-allowlisted Reader' do
      create :reader, email: 'reader@example.com'

      expect_legacy_authorization('reader@example.com')
    end

    it 'selects legacy credentials when the migration client ID is missing' do
      create :reader, email: 'nathan.papes@gmail.com'
      allow(ENV).to receive(:[]).with('GOOGLE_MIGRATION_CLIENT_ID')
                                .and_return('')

      expect_legacy_authorization('nathan.papes@gmail.com')
    end

    it 'selects legacy credentials when the migration secret is missing' do
      create :reader, email: 'nathan.papes@gmail.com'
      allow(ENV).to receive(:[]).with('GOOGLE_MIGRATION_CLIENT_SECRET')
                                .and_return(nil)

      expect_legacy_authorization('nathan.papes@gmail.com')
    end

    it 'overwrites an earlier session selection' do
      session['gala.google_oauth_client_selection'] = 'migration'

      expect_legacy_authorization('unknown@example.com')
    end
  end

  describe 'callback setup' do
    it 'consumes migration selection and recovers normalized saved params' do
      session['gala.google_oauth_client_selection'] = 'migration'
      session['omniauth.params'] = {
        'reader_email' => ' NATHAN.PAPES@GMAIL.COM ',
        'ignored' => 'not-an-identity'
      }

      env, options = callback_env
      described_class.call(env)

      expect(options).to include(client_id: migration_id,
                                 client_secret: migration_secret)
      expect(session).not_to have_key('gala.google_oauth_client_selection')
      expect(env['gala.google_oauth_migration_email'])
        .to eq('nathan.papes@gmail.com')
    end

    it 'selects legacy credentials when the marker is missing' do
      env, options = callback_env

      described_class.call(env)

      expect(options).to include(client_id: legacy_id,
                                 client_secret: legacy_secret)
      expect(env).not_to have_key('gala.google_oauth_migration_email')
    end

    it 'selects legacy credentials when the marker is unknown' do
      session['gala.google_oauth_client_selection'] = 'unexpected'
      env, options = callback_env

      described_class.call(env)

      expect(options).to include(client_id: legacy_id,
                                 client_secret: legacy_secret)
      expect(session).not_to have_key('gala.google_oauth_client_selection')
      expect(env).not_to have_key('gala.google_oauth_migration_email')
    end

    it 'fails closed with invalid sentinels when migration credentials vanish' do
      session['gala.google_oauth_client_selection'] = 'migration'
      session['omniauth.params'] = {
        'reader_email' => 'nathan.papes@gmail.com'
      }
      allow(ENV).to receive(:[]).with('GOOGLE_MIGRATION_CLIENT_SECRET')
                                .and_return(nil)

      env, options = callback_env
      described_class.call(env)

      expect(options).to include(
        client_id: GoogleOauthSetup::INVALID_MIGRATION_CLIENT_ID,
        client_secret: GoogleOauthSetup::INVALID_MIGRATION_CLIENT_SECRET
      )
      expect(env['gala.google_oauth_migration_email'])
        .to eq('nathan.papes@gmail.com')
    end

    it 'uses the recorded migration class after the Reader changes or is deleted' do
      reader = create :reader, email: 'nathan.papes@gmail.com'
      authorization_env('nathan.papes@gmail.com').first.then do |env|
        described_class.call(env)
      end
      session['omniauth.params'] = {
        'reader_email' => 'nathan.papes@gmail.com'
      }
      reader.update!(email: 'changed@example.com')
      reader.destroy!

      env, options = callback_env
      described_class.call(env)

      expect(options).to include(client_id: migration_id,
                                 client_secret: migration_secret)
      expect(env['gala.google_oauth_migration_email'])
        .to eq('nathan.papes@gmail.com')
    end
  end

  def authorization_env(email)
    rack_env(
      "/authentication_strategies/auth/google?#{Rack::Utils.build_query(reader_email: email)}"
    )
  end

  def callback_env
    rack_env('/authentication_strategies/auth/google/callback')
  end

  def rack_env(path)
    options = OmniAuth::Strategy::Options.new
    env = Rack::MockRequest.env_for(path)
    env['rack.session'] = session
    env['omniauth.strategy'] = strategy_class.new(options)
    [env, options]
  end

  def expect_legacy_authorization(email)
    env, options = authorization_env(email)
    described_class.call(env)

    expect(options).to include(client_id: legacy_id,
                               client_secret: legacy_secret)
    expect(session['gala.google_oauth_client_selection']).to eq('legacy')
  end
end
