# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CountryStatsService do
  describe '.resolve_country' do
    it 'returns unknown for nil input' do
      result = described_class.resolve_country(nil)
      expect(result).to eq({ iso2: nil, iso3: nil, name: 'Unknown' })
    end

    it 'returns unknown for empty input' do
      result = described_class.resolve_country('')
      expect(result).to eq({ iso2: nil, iso3: nil, name: 'Unknown' })
    end

    it 'resolves ISO2 code' do
      result = described_class.resolve_country('US')
      expect(result).to eq({ iso2: 'US', iso3: 'USA', name: 'United States' })
    end

    it 'resolves ISO3 code' do
      result = described_class.resolve_country('USA')
      expect(result).to eq({ iso2: 'US', iso3: 'USA', name: 'United States' })
    end

    it 'resolves country name' do
      result = described_class.resolve_country('United States')
      expect(result).to eq({ iso2: 'US', iso3: 'USA', name: 'United States' })
    end

    it 'handles case insensitive input' do
      result = described_class.resolve_country('united states')
      expect(result).to eq({ iso2: 'US', iso3: 'USA', name: 'United States' })
    end

    it 'returns fallback for unknown country' do
      result = described_class.resolve_country('Unknown Country')
      expect(result).to eq({ iso2: 'UNKNOWN COUNTRY', iso3: 'UNKNOWN COUNTRY', name: 'Unknown Country' })
    end
  end

  describe '.format_country_stats' do
    let(:raw_stats) do
      [
        {
          'country' => 'US',
          'unique_visits' => 100,
          'unique_users' => 50,
          'events_count' => 200,
          'deployments_count' => 5,
          'visit_podcast_count' => 10,
          'first_event' => Time.zone.parse('2023-01-01'),
          'last_event' => Time.zone.parse('2023-01-31')
        },
        {
          'country' => 'CA',
          'unique_visits' => 50,
          'unique_users' => 25,
          'events_count' => 100,
          'deployments_count' => 2,
          'visit_podcast_count' => 5,
          'first_event' => Time.zone.parse('2023-01-15'),
          'last_event' => Time.zone.parse('2023-01-30')
        }
      ]
    end

    it 'returns empty stats for empty input' do
      result = described_class.format_country_stats([])
      expect(result).to eq({
                             stats: [],
                             min_visits: 0,
                             max_visits: 0,
                             total_visits: 0,
                             country_count: 0,
                             total_deployments: 0,
                             total_podcast_listens: 0
                           })
    end

    it 'formats raw stats correctly' do
      result = described_class.format_country_stats(raw_stats)

      expect(result[:stats].length).to eq(2)
      expect(result[:total_visits]).to eq(150)
      expect(result[:country_count]).to eq(2)
      expect(result[:total_deployments]).to eq(7)
      expect(result[:total_podcast_listens]).to eq(15)
      expect(result[:min_visits]).to eq(50)
      expect(result[:max_visits]).to eq(100)

      # Check first country (US should be first due to higher visits)
      us_stat = result[:stats].first
      expect(us_stat[:iso2]).to eq('US')
      expect(us_stat[:iso3]).to eq('USA')
      expect(us_stat[:name]).to eq('United States')
      expect(us_stat[:unique_visits]).to eq(100)
      expect(us_stat[:unique_users]).to eq(50)
      expect(us_stat[:events_count]).to eq(200)
      expect(us_stat[:deployments_count]).to eq(5)
      expect(us_stat[:visit_podcast_count]).to eq(10)
      expect(us_stat[:first_event]).to eq(Time.zone.parse('2023-01-01'))
      expect(us_stat[:last_event]).to eq(Time.zone.parse('2023-01-31'))
    end
  end

  describe '.merge_stats' do
    let(:raw_stats) do
      [
        {
          'country' => 'US',
          'unique_visits' => 50,
          'unique_users' => 25,
          'events_count' => 100,
          'deployments_count' => 2,
          'visit_podcast_count' => 5,
          'first_event' => Time.zone.parse('2023-01-01'),
          'last_event' => Time.zone.parse('2023-01-15')
        },
        {
          'country' => 'US',
          'unique_visits' => 50,
          'unique_users' => 25,
          'events_count' => 100,
          'deployments_count' => 3,
          'visit_podcast_count' => 5,
          'first_event' => Time.zone.parse('2023-01-16'),
          'last_event' => Time.zone.parse('2023-01-31')
        }
      ]
    end

    it 'merges stats for the same country' do
      result = described_class.merge_stats(raw_stats)

      expect(result.length).to eq(1)
      merged = result.first

      expect(merged[:iso2]).to eq('US')
      expect(merged[:iso3]).to eq('USA')
      expect(merged[:name]).to eq('United States')
      expect(merged[:unique_visits]).to eq(100)
      expect(merged[:unique_users]).to eq(50)
      expect(merged[:events_count]).to eq(200)
      expect(merged[:deployments_count]).to eq(5)
      expect(merged[:visit_podcast_count]).to eq(10)
      expect(merged[:first_event]).to eq(Time.zone.parse('2023-01-01'))
      expect(merged[:last_event]).to eq(Time.zone.parse('2023-01-31'))
    end
  end
end
