# frozen_string_literal: true

require 'rails_helper'

# The Ahoy::Store spec hands track_visit an ip: of its own, which would keep
# passing if the real request path ever stopped supplying one. This covers
# the path a browser actually takes, where the address comes from
# request.remote_ip and Ahoy masks it before anything reads it.
RSpec.describe 'Recording a visit' do
  before { host! 'test.host' }

  def track(remote_addr)
    post '/ahoy/visits',
         params: { visit_token: SecureRandom.uuid, visitor_token: SecureRandom.uuid }.to_json,
         headers: { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => remote_addr }
    Visit.order(:id).last
  end

  it 'stores the masked address and the country it resolves to' do
    visit = track('8.8.8.8')

    expect(response).to have_http_status(:success)
    expect(visit.ip).to eq '8.8.8.0'
    expect(visit.country).to eq 'US'
  end

  it 'records no country for an address the database does not cover' do
    expect(track('10.1.2.3').country).to be_nil
  end

  # Ahoy::Tracker#track_visit enqueues Ahoy::GeocodeV2Job, which calls
  # Geocoder.search and thereby sends the address to ipinfo.io. Only
  # Ahoy.geocode = false stops that, and nothing else would show if it came
  # back: Ahoy::DatabaseStore#geocode passes its data through slice_data, so
  # the columns this migration dropped get discarded silently and a
  # regression would write a country and raise nothing. Geocoder is the one
  # egress point, so watch it directly.
  describe 'the address leaving the process' do
    it 'never reaches Geocoder' do
      expect(Geocoder).not_to receive(:search)

      expect(track('8.8.8.8').country).to eq 'US'
    end

    # Without this the example above can pass for the wrong reason: written
    # against Ahoy::Store instead, it passes even with geocoding on, because
    # the job is enqueued a layer above in Ahoy::Tracker.
    it 'reaches Geocoder when Ahoy.geocode is on, so the guard above is real' do
      allow(Ahoy).to receive(:geocode).and_return(true)
      expect(Geocoder).to receive(:search)
        .with('8.8.8.0').at_least(:once).and_return([])

      track('8.8.8.8')
    end
  end
end
