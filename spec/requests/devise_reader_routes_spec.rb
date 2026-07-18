# frozen_string_literal: true

require 'cgi'
require 'rails_helper'
require 'uri'

RSpec.describe 'Devise reader routes' do
  def configured_auth_uri(route_env_key)
    URI.parse(normalized_auth_url(route_env_key)).tap do |uri|
      validate_auth_uri!(uri, route_env_key)

      strip_uri_request_parts(uri)
    end
  end

  def normalized_auth_url(route_env_key)
    raw_url = [
      ENV[route_env_key],
      ENV['GALA_TEST_AUTH_BASE_URL'],
      ENV['BASE_URL'],
      default_auth_base_url
    ].map { |value| value.to_s.strip }.detect(&:present?)

    raw_url = "https://#{raw_url}" unless raw_url.match?(%r{\Ahttps?://})
    raw_url.sub(%r{\Ahttp://}, 'https://')
  end

  def default_auth_base_url
    'https://www.example.com'
  end

  def validate_auth_uri!(uri, route_env_key)
    return if uri.host.present?

    raise "#{route_env_key}, GALA_TEST_AUTH_BASE_URL, or BASE_URL " \
          'must include a host'
  end

  def strip_uri_request_parts(uri)
    uri.path = ''
    uri.query = nil
    uri.fragment = nil
  end

  def configured_auth_base_url(route_env_key)
    uri = configured_auth_uri(route_env_key)
    port = uri.port == uri.default_port ? '' : ":#{uri.port}"

    "#{uri.scheme}://#{uri.host}#{port}"
  end

  def configured_auth_host(route_env_key)
    uri = configured_auth_uri(route_env_key)
    port = uri.port == uri.default_port ? '' : ":#{uri.port}"

    "#{uri.host}#{port}"
  end

  def current_csrf_origin_settings
    [
      ActionController::Base.allow_forgery_protection,
      Rails.application.config.action_controller.forgery_protection_origin_check
    ]
  end

  def enable_csrf_origin_check
    ActionController::Base.allow_forgery_protection = true
    Rails.application.config.action_controller.forgery_protection_origin_check =
      true
  end

  def restore_csrf_origin_settings(settings)
    previous_forgery_protection, previous_origin_check = settings
    ActionController::Base.allow_forgery_protection =
      previous_forgery_protection
    Rails.application.config.action_controller.forgery_protection_origin_check =
      previous_origin_check
  end

  def with_csrf_origin_check
    previous_settings = current_csrf_origin_settings
    enable_csrf_origin_check

    yield
  ensure
    https!(false)
    restore_csrf_origin_settings(previous_settings)
  end

  it 'renders the reader sign-in form' do
    get new_reader_session_path

    expect(response).to have_http_status(:success)
    expect(response.body).to include('Sign in')

    document = Nokogiri::HTML.parse(response.body)
    form = document.at_css('form#new_reader')
    email = form.at_css('input[type="email"]')
    google_link = form.at_css('a.oauth-icon-google:not(.bp6-disabled)')

    expect(form['data-controller']).to eq('google-oauth')
    expect(email['data-target']).to eq('google-oauth.email')
    expect(google_link['data-action']).to eq(
      'click->google-oauth#authorize'
    )
    expect(google_link['href']).to eq(
      '/authentication_strategies/auth/google'
    )
    expect(URI.parse(google_link['href']).query).to be_nil
  end

  it 'renders a public Devise helper form' do
    get new_reader_password_path

    expect(response).to have_http_status(:success)
  end

  it 'renders the registration form' do
    get new_reader_registration_path

    expect(response).to have_http_status(:success)

    document = Nokogiri::HTML.parse(response.body)
    form = document.at_css('form#new_reader')
    email = form.at_css('input[type="email"]')
    google_link = form.at_css('a.oauth-icon-google:not(.bp6-disabled)')

    expect(form['data-controller']).to eq('google-oauth')
    expect(email['data-target']).to eq('google-oauth.email')
    expect(google_link['data-action']).to eq(
      'click->google-oauth#authorize'
    )
    expect(google_link['href']).to eq(
      '/authentication_strategies/auth/google'
    )
    expect(URI.parse(google_link['href']).query).to be_nil
  end

  it 'creates a reader over an HTTPS origin with CSRF protection enabled' do
    with_csrf_origin_check do
      base_url = configured_auth_base_url('GALA_TEST_SIGN_UP_BASE_URL')
      host! configured_auth_host('GALA_TEST_SIGN_UP_BASE_URL')
      https!

      get new_reader_registration_path

      token = response.body[/name="authenticity_token" value="([^"]+)"/, 1]
      expect(token).to be_present

      email = "signup-#{SecureRandom.hex(4)}@example.com"
      post reader_registration_path,
           params: {
             authenticity_token: CGI.unescapeHTML(token),
             reader: {
               name: 'Sign Up Reader',
               locale: 'en',
               email:,
               password: 'password123',
               password_confirmation: 'password123'
             }
           },
           headers: { 'HTTP_ORIGIN' => base_url }

      expect(response).not_to have_http_status(:unprocessable_entity)
      expect(response).not_to have_http_status(:internal_server_error)
      expect(Reader.exists?(email:)).to be(true)
    end
  end

  it 'signs in a reader over an HTTPS origin with CSRF protection enabled' do
    with_csrf_origin_check do
      base_url = configured_auth_base_url('GALA_TEST_SIGN_IN_BASE_URL')
      host! configured_auth_host('GALA_TEST_SIGN_IN_BASE_URL')
      https!

      reader = create(:reader)

      get new_reader_session_path

      token = response.body[/name="authenticity_token" value="([^"]+)"/, 1]
      expect(token).to be_present

      post reader_session_path,
           params: {
             authenticity_token: CGI.unescapeHTML(token),
             reader: {
               email: reader.email,
               password: 'secret',
               remember_me: '0'
             },
             commit: 'Sign in'
           },
           headers: {
             'HTTP_ORIGIN' => base_url
           }

      expect(response).to have_http_status(:found)
      expect(response.location).to start_with(
        "#{base_url}/"
      )
    end
  end

  it 'redirects an unauthenticated profile edit request to sign in' do
    get edit_profile_path

    expect(response).to redirect_to(new_reader_session_path)
  end

  it 'renders profile edit for a signed-in reader with current terms' do
    reader = create(:reader)
    sign_in reader

    get edit_profile_path

    expect(response).to have_http_status(:success)
  end

  it 'renders profile edit even when terms acceptance is pending' do
    reader = create(:reader, terms_of_service: nil)
    sign_in reader

    get edit_profile_path

    expect(response).to have_http_status(:success)
  end

  it 'updates profile details for the current reader' do
    reader = create(:reader)
    sign_in reader

    patch profile_path, params: { reader: { name: 'Updated Reader' } }

    expect(response).to redirect_to(edit_profile_path)
    expect(reader.reload.name).to eq('Updated Reader')
  end

  it 'redirects magic link without a key to the home page' do
    get magic_link_path

    expect(response).to redirect_to(root_path)
  end

  it 'preserves current invalid magic-link create behavior' do
    post magic_link_path

    expect(response).to redirect_to(new_reader_registration_path)
  end
end
