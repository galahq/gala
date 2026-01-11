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
      expect(result).to eq({ iso2: 'US', iso3: 'USA', name: 'United States of America' })
    end

    it 'resolves ISO3 code' do
      result = described_class.resolve_country('USA')
      expect(result).to eq({ iso2: 'US', iso3: 'USA', name: 'United States of America' })
    end

    it 'resolves country name' do
      result = described_class.resolve_country('United States of America')
      expect(result).to eq({ iso2: 'US', iso3: 'USA', name: 'United States of America' })
    end

    it 'handles case insensitive input' do
      result = described_class.resolve_country('united states')
      expect(result).to eq({ iso2: 'US', iso3: 'USA', name: 'United States of America' })
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
          'visit_edgenote_count' => 5,
          'visit_page_count' => 20,
          'visit_element_count' => 15,
          'read_quiz_count' => 8,
          'read_overview_count' => 12,
          'read_card_count' => 18,
          'write_comment_count' => 3,
          'write_comment_thread_count' => 2,
          'write_quiz_submission_count' => 1,
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
          'visit_edgenote_count' => 3,
          'visit_page_count' => 10,
          'visit_element_count' => 8,
          'read_quiz_count' => 4,
          'read_overview_count' => 6,
          'read_card_count' => 9,
          'write_comment_count' => 1,
          'write_comment_thread_count' => 1,
          'write_quiz_submission_count' => 0,
          'first_event' => Time.zone.parse('2023-01-15'),
          'last_event' => Time.zone.parse('2023-01-30')
        }
      ]
    end

    it 'returns empty stats for empty input' do
      result = described_class.format_country_stats([])
      expect(result).to eq({
                             stats: [],
                             bins: [],
                             bin_count: 5,
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

      # Check first country (US should be first due to higher visits)
      us_stat = result[:stats].first
      expect(us_stat[:iso2]).to eq('US')
      expect(us_stat[:name]).to eq('United States of America')
      expect(us_stat[:unique_visits]).to eq(100)
      expect(us_stat[:unique_users]).to eq(50)
      expect(us_stat[:events_count]).to eq(200)
      expect(us_stat[:deployments_count]).to eq(5)
      expect(us_stat[:visit_podcast_count]).to eq(10)
      expect(us_stat[:write_quiz_submission_count]).to eq(1)
    end

    it 'calculates bins correctly' do
      result = described_class.format_country_stats(raw_stats)

      expect(result[:bins].length).to eq(5)
      expect(result[:bins].first[:bin]).to eq(0)
      expect(result[:bins].first[:percentile]).to eq(0)
      expect(result[:bins].last[:bin]).to eq(4)
      expect(result[:bins].last[:percentile]).to eq(100)
      expect(result[:bin_count]).to eq(5)
    end

    it 'accepts custom bin count' do
      result = described_class.format_country_stats(raw_stats, 3)

      expect(result[:bins].length).to eq(3)
      expect(result[:bins].first[:bin]).to eq(0)
      expect(result[:bins].last[:bin]).to eq(2)
      expect(result[:bin_count]).to eq(3)
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
      expect(merged[:unique_visits]).to eq(100)
      expect(merged[:unique_users]).to eq(50)
      expect(merged[:events_count]).to eq(200)
      expect(merged[:deployments_count]).to eq(5)
      expect(merged[:visit_podcast_count]).to eq(10)
      expect(merged[:first_event]).to eq(Time.zone.parse('2023-01-01'))
      expect(merged[:last_event]).to eq(Time.zone.parse('2023-01-31'))
    end
  end

  describe '.calculate_bins' do
    it 'returns empty array for empty input' do
      result = described_class.calculate_bins([])
      expect(result).to eq([])
    end

    it 'calculates bins for single value' do
      result = described_class.calculate_bins([100])

      expect(result.length).to eq(5)
      expect(result.first[:bin]).to eq(0)
      expect(result.first[:percentile]).to eq(0)
      expect(result.first[:value]).to eq(100)
      expect(result.last[:bin]).to eq(4)
      expect(result.last[:percentile]).to eq(100)
      expect(result.last[:value]).to eq(100)
      # For single value, all bins should have the same value
      expect(result.map { |b| b[:value] }).to all(eq(100))
    end

    it 'calculates bins for multiple values' do
      values = [10, 20, 30, 40, 50]
      result = described_class.calculate_bins(values)

      expect(result.length).to eq(5)
      expect(result.map { |b| b[:bin] }).to eq([0, 1, 2, 3, 4])
      expect(result.map { |b| b[:percentile] }).to eq([0, 25, 50, 75, 100])
    end

    it 'accepts custom bin count' do
      values = [10, 20, 30, 40, 50]
      result = described_class.calculate_bins(values, 3)

      expect(result.length).to eq(3)
      expect(result.map { |b| b[:bin] }).to eq([0, 1, 2])
      expect(result.map { |b| b[:percentile] }).to eq([0, 50, 100])
    end
  end

  describe '.get_bin' do
    let(:bins) do
      [
        { bin: 0, percentile: 0, value: 10 },
        { bin: 1, percentile: 25, value: 25 },
        { bin: 2, percentile: 50, value: 50 },
        { bin: 3, percentile: 75, value: 75 },
        { bin: 4, percentile: 100, value: 100 }
      ]
    end

    it 'returns 0 for zero value' do
      result = described_class.get_bin(0, bins)
      expect(result).to eq(0)
    end

    it 'returns correct bin' do
      expect(described_class.get_bin(30, bins)).to eq(1)
      expect(described_class.get_bin(80, bins)).to eq(3)
      expect(described_class.get_bin(5, bins)).to eq(0)
    end
  end
end
