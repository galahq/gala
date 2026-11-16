# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GeoIp do
  describe '.country_code' do
    # Ahoy masks to a /24 before anything reads the address, so these are the
    # shape of address this actually receives.
    it 'resolves a masked IPv4 address' do
      expect(described_class.country_code('8.8.8.0')).to eq 'US'
      expect(described_class.country_code('193.1.1.0')).to eq 'IE'
    end

    it 'resolves a masked IPv6 address' do
      expect(described_class.country_code('2001:4860:4860::')).to eq 'CA'
    end

    it 'returns nil for an address the database does not cover' do
      expect(described_class.country_code('10.0.0.0')).to be_nil
      expect(described_class.country_code('127.0.0.1')).to be_nil
    end

    it 'returns nil rather than raising on a malformed address' do
      expect(described_class.country_code('not-an-ip')).to be_nil
    end

    it 'returns nil when there is no address' do
      expect(described_class.country_code(nil)).to be_nil
      expect(described_class.country_code('')).to be_nil
    end
  end

  describe '.built_at' do
    it 'reports when the database was built' do
      expect(described_class.built_at).to be_a(ActiveSupport::TimeWithZone)
    end
  end
end
