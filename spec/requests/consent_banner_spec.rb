# frozen_string_literal: true

require 'rails_helper'

# The banner is decided server-side from the address, because the browser does
# not know what country it is in. These cover the four states the layout can
# render, through a real page that nests in the application layout.
RSpec.describe 'The consent banner' do
  before { host! 'test.host' }

  def load_catalog(remote_addr, decision: nil)
    cookies[:gala_consent] = decision if decision
    get root_path, headers: { 'REMOTE_ADDR' => remote_addr }
    expect(response).to have_http_status(:success)
    response.body
  end

  it 'does not ask a visitor outside the EU, EEA and UK' do
    body = load_catalog('8.8.8.8')

    expect(body).not_to include('consent-banner')
    expect(body).to include('window.GALA_CONSENT = { required: false, granted: true }')
  end

  it 'asks an unanswered visitor in the EU' do
    body = load_catalog('90.0.0.1')

    expect(body).to include('consent-banner')
    expect(body).to include('Cookies on Gala')
    expect(body).to include('window.GALA_CONSENT = { required: true, granted: false }')
  end

  # DB-IP does not flag the UK as EU, so this is the four-code supplement
  # working rather than the EU flag.
  it 'asks an unanswered visitor in the UK' do
    expect(load_catalog('51.140.0.1')).to include('consent-banner')
  end

  it 'stops asking, and allows tracking, once the visitor accepts' do
    body = load_catalog('90.0.0.1', decision: 'granted')

    expect(body).not_to include('consent-banner')
    expect(body).to include('window.GALA_CONSENT = { required: true, granted: true }')
  end

  it 'stops asking, and keeps tracking off, once the visitor declines' do
    body = load_catalog('90.0.0.1', decision: 'denied')

    expect(body).not_to include('consent-banner')
    expect(body).to include('window.GALA_CONSENT = { required: true, granted: false }')
  end

  # An unrecognised value is somebody else's cookie or a mangled one, and must
  # not be read as a yes.
  it 'asks again when the cookie holds something it does not recognise' do
    body = load_catalog('90.0.0.1', decision: 'yes-please')

    expect(body).to include('consent-banner')
    expect(body).to include('granted: false')
  end
  # Withdrawal has to be reachable, so a visitor who answered gets a link back
  # to the question. The footer lives in the with_header layout, which the
  # catalog uses.
  describe 'the way back to the question' do
    it 'offers it to a visitor who has accepted' do
      expect(load_catalog('90.0.0.1', decision: 'granted')).to include('Cookie choices')
    end

    it 'offers it to a visitor who has declined' do
      expect(load_catalog('90.0.0.1', decision: 'denied')).to include('Cookie choices')
    end

    # They are looking at the banner itself, so a second route to it would be
    # noise.
    it 'does not offer it while the banner is still showing' do
      expect(load_catalog('90.0.0.1')).not_to include('Cookie choices')
    end

    # Nothing was ever asked, so there is no choice on record to change.
    it 'does not offer it outside the EU, EEA and UK' do
      expect(load_catalog('8.8.8.8')).not_to include('Cookie choices')
    end
  end
  # mapbox-gl has no telemetry opt-out, so the components refuse to mount it.
  # The layout also withholds the token, which is what stops a component that
  # forgets to check from reaching Mapbox anyway.
  describe 'the Mapbox token' do
    # The layout falls back to MAPBOX_TOKEN_REMOVED when no token is
    # configured, and CI configures none. Without a real one here, "withheld
    # because they declined" and "never set up" render identically and these
    # examples would pass whatever the code did.
    around do |example|
      cached = ENV.values_at('MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken')
      ENV['MAPBOX_ACCESS_TOKEN'] = 'pk.test-token'
      ENV['MapboxAccessToken'] = nil
      example.run
      ENV['MAPBOX_ACCESS_TOKEN'], ENV['MapboxAccessToken'] = cached
    end

    it 'is withheld from a visitor who declined' do
      body = load_catalog('90.0.0.1', decision: 'denied')

      expect(body).to include("window.MAPBOX_ACCESS_TOKEN = 'MAPBOX_TOKEN_REMOVED'")
      expect(body).not_to include('pk.test-token')
      expect(body).not_to include('name="mapbox-access-token"')
    end

    it 'is withheld from a visitor who has not answered yet' do
      body = load_catalog('90.0.0.1')

      expect(body).to include("window.MAPBOX_ACCESS_TOKEN = 'MAPBOX_TOKEN_REMOVED'")
      expect(body).not_to include('pk.test-token')
    end

    # Nothing changes for the rest of the world.
    it 'is left alone outside the EU, EEA and UK' do
      body = load_catalog('8.8.8.8')

      expect(body).to include("window.MAPBOX_ACCESS_TOKEN = 'pk.test-token'")
      expect(body).to include('name="mapbox-access-token"')
    end
  end
  # Regression cover for the review of #817. Each of these failed before the
  # fix, and each failure was invisible: the banner still looked right on the
  # page the developer happened to load.
  describe 'responses that carry one visitor’s answer' do
    it 'is never revalidated to a 304, so Accept can take effect' do
      load_catalog('90.0.0.1')
      validator = response.headers['ETag']

      expect(response.headers['Cache-Control']).to include('no-store')

      # This is the Accept path: the same URL, now consented, carrying
      # whatever validator the previous response offered. accept() works by
      # reloading, so a 304 here would hand the browser back the body
      # rendered before the answer and leave the banner on the screen.
      cookies[:gala_consent] = 'granted'
      get root_path,
          headers: { 'REMOTE_ADDR' => '90.0.0.1', 'HTTP_IF_NONE_MATCH' => validator }

      expect(response).to have_http_status(:success)
      expect(response.body).to include('granted: true')
    end

    it 'leaves caching alone for everyone else' do
      load_catalog('8.8.8.8')

      expect(response.headers['Cache-Control']).to include('s-maxage')
    end
  end

  # The case page is cached as whole rendered HTML, layout included, under a
  # key that knows nothing about country or consent. A French visitor used to
  # be served the body rendered for an American one: no banner, granted: true,
  # and the real Mapbox token.
  describe 'the cached case page' do
    around do |example|
      previous = Rails.cache
      ActionController::Base.perform_caching = true
      Rails.cache = ActiveSupport::Cache::MemoryStore.new
      example.run
    ensure
      Rails.cache = previous
      ActionController::Base.perform_caching = false
    end

    it 'does not serve one country’s page to another' do
      kase = create(:case, :published)

      get case_path(kase), headers: { 'REMOTE_ADDR' => '8.8.8.8' }
      expect(response.body).not_to include('consent-banner')

      get case_path(kase), headers: { 'REMOTE_ADDR' => '90.0.0.1' }
      expect(response.body).to include('consent-banner')
      expect(response.body)
        .to include('window.GALA_CONSENT = { required: true, granted: false }')
    end

    it 'does not let one unanswered visitor put a banner on everyone else' do
      kase = create(:case, :published)

      get case_path(kase), headers: { 'REMOTE_ADDR' => '90.0.0.1' }
      expect(response.body).to include('consent-banner')

      get case_path(kase), headers: { 'REMOTE_ADDR' => '8.8.8.8' }
      expect(response.body).not_to include('consent-banner')
    end
  end

  # Clicking "Cookie choices" to look at the question used to delete the
  # decision, silently un-consenting someone who then navigated away.
  it 'reopens the question without withdrawing the answer' do
    cookies[:gala_consent] = 'granted'
    cookies[:gala_consent_reopen] = '1'

    get root_path, headers: { 'REMOTE_ADDR' => '90.0.0.1' }

    expect(response.body).to include('consent-banner')
    expect(response.body).to include('granted: true')
    expect(response.body).not_to include('Cookie choices')
  end
  # The map placeholders are rendered by React, not by the layout, so nothing
  # above reaches them. Their real failure mode is not the branch that picks
  # between the two messages — it is a renamed key: react-intl renders the id
  # itself when a message is missing, so the page would show
  # "application.consentBanner.mapHidden" as visible text. The ids are read
  # out of the source rather than restated here, so a rename on either side
  # fails this.
  describe 'the message ids the map components look up' do
    let(:ids) do
      Dir[Rails.root.join('app/javascript/**/*.jsx')]
        .flat_map { |file| File.read(file).scan(/application\.consentBanner\.(\w+)/) }
        .flatten.uniq
    end

    it 'uses a separate message for the reader and the author' do
      expect(ids).to include('mapHidden', 'mapEditingHidden')
    end

    it 'resolves every one of them in en.yml' do
      expect(ids).not_to be_empty

      ids.each do |camel|
        key = camel.gsub(/([A-Z])/) { "_#{Regexp.last_match(1).downcase}" }
        expect(I18n.t("application.consent_banner.#{key}", default: nil))
          .to be_present, "en.yml has no application.consent_banner.#{key}"
      end
    end
  end
end
