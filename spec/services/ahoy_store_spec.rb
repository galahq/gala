# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Ahoy::Store do
  describe '#track_visit' do
    def track(ip)
      described_class.new({}).track_visit(
        visit_token: SecureRandom.uuid,
        visitor_token: SecureRandom.uuid,
        ip: ip,
        started_at: Time.current
      )
      Visit.order(:id).last
    end

    it 'records the country from the local database' do
      expect(track('8.8.8.0').country).to eq 'US'
    end

    it 'leaves the country unset for an address the database does not cover' do
      expect(track('10.0.0.0').country).to be_nil
    end
  end

  # The point of the change: Ahoy's own geocoding is what sent addresses to
  # ipinfo.io, so it has to stay off.
  it 'does not let Ahoy geocode' do
    expect(Ahoy.geocode).to be false
  end
end
