# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Google OAuth migration', type: :request do
  let(:legacy_id) { 'fake-legacy-client-id' }
  let(:legacy_secret) { 'fake-legacy-client-secret' }
  let(:migration_id) { 'fake-migration-client-id' }
  let(:migration_secret) { 'fake-migration-client-secret' }
  let(:setup_calls) { [] }

  around do |example|
    previous_mock = OmniAuth.config.mock_auth[:google]
    example.run
  ensure
    OmniAuth.config.mock_auth[:google] = previous_mock
  end

  before do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('GOOGLE_CLIENT_ID').and_return(legacy_id)
    allow(ENV).to receive(:[]).with('GOOGLE_CLIENT_SECRET')
                              .and_return(legacy_secret)
    allow(ENV).to receive(:[]).with('GOOGLE_MIGRATION_CLIENT_ID')
                              .and_return(migration_id)
    allow(ENV).to receive(:[]).with('GOOGLE_MIGRATION_CLIENT_SECRET')
                              .and_return(migration_secret)
    allow(CleanupLocksJob).to receive(:perform_later)
    allow(GoogleOauthSetup).to receive(:call).and_wrap_original do |call, env|
      call.call(env).tap do
        setup_calls << {
          path: env['PATH_INFO'],
          client_id: env['omniauth.strategy'].options[:client_id],
          marker: env['gala.google_oauth_migration_email']
        }
      end
    end
  end

  it 'links a matching verified migration identity to the existing Reader' do
    reader = create :reader, email: 'nathan.papes@gmail.com'
    legacy_strategy = create :authentication_strategy, :google,
                             reader: reader, uid: 'legacy-google-uid'
    set_google_auth email: 'NATHAN.PAPES@GMAIL.COM', verified: true,
                    uid: 'migration-google-uid'

    begin_google_oauth(' nathan.papes@gmail.com ')

    expect do
      complete_google_oauth
    end.to change(AuthenticationStrategy, :count).by(1)
                                                 .and change(Reader, :count).by(0)

    migration_strategy = AuthenticationStrategy.find_by!(
      provider: 'google', uid: 'migration-google-uid'
    )
    expect(migration_strategy.reader).to eq(reader)
    expect(AuthenticationStrategy.exists?(legacy_strategy.id)).to be true
    expect(reader.authentication_strategies.reload).to include(
      legacy_strategy, migration_strategy
    )
    expect(setup_calls).to contain_exactly(
      { path: google_authorize_path, client_id: migration_id, marker: nil },
      {
        path: google_callback_path,
        client_id: migration_id,
        marker: 'nathan.papes@gmail.com'
      }
    )
  end

  it 'rejects a mismatched verified migration identity before any writes' do
    create :reader, email: 'nathan.papes@gmail.com'
    set_google_auth email: 'attacker@example.com', verified: true,
                    uid: 'attacker-google-uid'
    begin_google_oauth('nathan.papes@gmail.com')

    expect do
      complete_google_oauth
    end.to change(AuthenticationStrategy, :count).by(0)
                                                 .and change(Reader, :count).by(0)

    expect(response).to redirect_to(root_path)
  end

  it 'rejects an unverified migration identity before any writes' do
    create :reader, email: 'nathan.papes@gmail.com'
    set_google_auth email: 'nathan.papes@gmail.com', verified: false,
                    uid: 'unverified-google-uid'
    begin_google_oauth('nathan.papes@gmail.com')

    expect do
      complete_google_oauth
    end.to change(AuthenticationStrategy, :count).by(0)
                                                 .and change(Reader, :count).by(0)

    expect(response).to redirect_to(root_path)
  end

  it 'keeps legacy credentials across both legs for a legacy selection' do
    set_google_auth email: 'legacy-reader@example.com', verified: true,
                    uid: 'legacy-only-google-uid'

    begin_google_oauth('legacy-reader@example.com')
    complete_google_oauth

    expect(setup_calls).to contain_exactly(
      { path: google_authorize_path, client_id: legacy_id, marker: nil },
      { path: google_callback_path, client_id: legacy_id, marker: nil }
    )
    expect(AuthenticationStrategy.find_by!(uid: 'legacy-only-google-uid')
      .provider).to eq('google')
  end

  it 'consumes the migration selection on callback' do
    create :reader, email: 'nathan.papes@gmail.com'
    set_google_auth email: 'nathan.papes@gmail.com', verified: true,
                    uid: 'migration-google-uid'

    begin_google_oauth('nathan.papes@gmail.com')
    complete_google_oauth
    setup_calls.clear
    complete_google_oauth

    expect(setup_calls).to contain_exactly(
      { path: google_callback_path, client_id: legacy_id, marker: nil }
    )
  end

  it 'keeps migration classification when callback credentials disappear' do
    create :reader, email: 'nathan.papes@gmail.com'
    set_google_auth email: 'nathan.papes@gmail.com', verified: true,
                    uid: 'migration-google-uid'

    begin_google_oauth('nathan.papes@gmail.com')
    allow(ENV).to receive(:[]).with('GOOGLE_MIGRATION_CLIENT_SECRET')
                              .and_return(nil)
    complete_google_oauth

    callback_setup = setup_calls.find do |call|
      call[:path] == google_callback_path
    end
    expect(callback_setup).to eq(
      path: google_callback_path,
      client_id: GoogleOauthSetup::INVALID_MIGRATION_CLIENT_ID,
      marker: 'nathan.papes@gmail.com'
    )
  end

  it 'preserves the google provider name and callback path' do
    config = Devise.omniauth_configs.fetch(:google)

    expect(config.strategy_name).to eq('google')
    expect(config.options[:setup]).to eq(GoogleOauthSetup)
    expect(google_authorize_path).to eq(
      '/authentication_strategies/auth/google'
    )
    expect(google_callback_path).to eq(
      '/authentication_strategies/auth/google/callback'
    )
  end

  def begin_google_oauth(email)
    get google_authorize_path, params: { reader_email: email }
    expect(response).to redirect_to("http://www.example.com#{google_callback_path}")
  end

  def complete_google_oauth
    get google_callback_path
  end

  def google_authorize_path
    authentication_strategy_google_omniauth_authorize_path
  end

  def google_callback_path
    authentication_strategy_google_omniauth_callback_path
  end

  def set_google_auth(email:, verified:, uid:)
    OmniAuth.config.mock_auth[:google] = OmniAuth::AuthHash.new(
      provider: 'google',
      uid: uid,
      info: {
        email: email,
        email_verified: verified,
        name: 'OAuth Test Reader'
      },
      extra: {}
    )
  end
end

RSpec.describe AuthenticationStrategies::OmniauthCallbacksController,
               type: :controller do
  before do
    @routes = ActionDispatch::Routing::RouteSet.new
    @routes.draw do
      get 'failure' =>
        'authentication_strategies/omniauth_callbacks#failure'
    end
    request.env['devise.mapping'] = Devise.mappings[:authentication_strategy]
  end

  it 'clears a stale Google client selection in the failure action' do
    session[GoogleOauthSetup::SELECTION_KEY] = 'migration'

    get :failure

    expect(response).to redirect_to('/')
    expect(session).not_to have_key(GoogleOauthSetup::SELECTION_KEY)
  end
end
