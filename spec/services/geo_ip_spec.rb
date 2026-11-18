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

  describe '.consent_required?' do
    it 'asks a visitor in an EU member state' do
      expect(described_class.consent_required?('90.0.0.0')).to be true
    end

    # DB-IP reports is_in_european_union: false for all four of these, so the
    # flag alone would miss them. The assertion below is the reason
    # CONSENT_REQUIRED_OUTSIDE_EU exists; without it these would be tracked.
    it 'asks a visitor in the UK or the rest of the EEA' do
      expect(described_class.consent_required?('51.140.0.0')).to be true
      expect(described_class.consent_required?('51.120.0.0')).to be true
    end

    it 'does not ask a visitor outside the EU, EEA and UK' do
      expect(described_class.consent_required?('8.8.8.0')).to be false
      expect(described_class.consent_required?('45.133.0.0')).to be false
    end

    # Fails closed: an unplaceable visitor is asked rather than tracked.
    it 'asks when it cannot place the address at all' do
      expect(described_class.consent_required?('10.0.0.0')).to be true
      expect(described_class.consent_required?('not-an-ip')).to be true
      expect(described_class.consent_required?(nil)).to be true
      expect(described_class.consent_required?('')).to be true
    end
  end

  # Guards the premise of the test above rather than any of our own code: if a
  # DB-IP refresh ever started marking the UK as EU, the supplement would be
  # double-counting and this says so.
  describe 'the database itself' do
    it 'does not mark the UK or Norway as EU members' do
      record = described_class.send(:country_record, '51.140.0.0')
      expect(record['is_in_european_union']).to be false
      expect(described_class.send(:country_record, '51.120.0.0')['is_in_european_union'])
        .to be false
    end
  end

  describe '.built_at' do
    it 'reports when the database was built' do
      expect(described_class.built_at).to be_a(ActiveSupport::TimeWithZone)
    end
  end
end
