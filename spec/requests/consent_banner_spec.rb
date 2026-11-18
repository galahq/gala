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
    it 'is withheld from a visitor who declined' do
      body = load_catalog('90.0.0.1', decision: 'denied')

      expect(body).to include("window.MAPBOX_ACCESS_TOKEN = 'MAPBOX_TOKEN_REMOVED'")
      expect(body).not_to include('name="mapbox-access-token"')
    end

    it 'is withheld from a visitor who has not answered yet' do
      expect(load_catalog('90.0.0.1'))
        .to include("window.MAPBOX_ACCESS_TOKEN = 'MAPBOX_TOKEN_REMOVED'")
    end

    # Nothing changes for the rest of the world.
    it 'is left alone outside the EU, EEA and UK' do
      expect(load_catalog('8.8.8.8'))
        .not_to include("window.MAPBOX_ACCESS_TOKEN = 'MAPBOX_TOKEN_REMOVED'")
    end
  end
end
