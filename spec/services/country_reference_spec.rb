# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CountryReference do
  describe '.resolve' do
    it 'returns Unknown for blank values' do
      expect(described_class.resolve(nil)).to eq(iso2: nil, iso3: nil, name: 'Unknown')
      expect(described_class.resolve('')).to eq(iso2: nil, iso3: nil, name: 'Unknown')
      expect(described_class.resolve('unknown')).to eq(iso2: nil, iso3: nil, name: 'Unknown')
    end

    it 'resolves iso2, iso3, and english names' do
      expect(described_class.resolve('us')).to eq(
        iso2: 'US',
        iso3: 'USA',
        name: 'United States'
      )

      expect(described_class.resolve('usa')).to eq(
        iso2: 'US',
        iso3: 'USA',
        name: 'United States'
      )

      expect(described_class.resolve('United States')).to eq(
        iso2: 'US',
        iso3: 'USA',
        name: 'United States'
      )
    end

    it 'supports common aliases from noisy ahoy values' do
      expect(described_class.resolve('U.S.')).to eq(
        iso2: 'US',
        iso3: 'USA',
        name: 'United States'
      )

      expect(described_class.resolve('UK')).to eq(
        iso2: 'GB',
        iso3: 'GBR',
        name: 'United Kingdom'
      )
    end

    it 'keeps unresolved free-form values untouched' do
      expect(described_class.resolve('Unknown Country')).to eq(
        iso2: nil,
        iso3: nil,
        name: 'Unknown Country'
      )
    end
  end
end
