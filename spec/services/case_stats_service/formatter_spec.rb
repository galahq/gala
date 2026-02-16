# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CaseStatsService::Formatter do
  describe '.format_country_stats' do
    context 'with empty input' do
      it 'returns empty stats with zero totals' do
        result = described_class.format_country_stats([])

        expect(result[:stats]).to eq([])
        expect(result[:total_visits]).to eq(0)
        expect(result[:country_count]).to eq(0)
        expect(result[:total_podcast_listens]).to eq(0)
      end
    end

    context 'with single country' do
      let(:raw_stats) do
        [{
          'country' => 'US',
          'unique_visits' => 100,
          'unique_users' => 50,
          'events_count' => 200,
          'visit_podcast_count' => 10,
          'first_event' => Time.new(2024, 1, 1),
          'last_event' => Time.new(2024, 1, 31)
        }]
      end

      it 'normalizes country data' do
        result = described_class.format_country_stats(raw_stats)

        expect(result[:stats].length).to eq(1)
        expect(result[:stats].first[:iso2]).to eq('US')
        expect(result[:stats].first[:iso3]).to eq('USA')
        expect(result[:stats].first[:name]).to eq('United States')
      end

      it 'calculates totals correctly' do
        result = described_class.format_country_stats(raw_stats)

        expect(result[:total_visits]).to eq(100)
        expect(result[:country_count]).to eq(1)
        expect(result[:total_podcast_listens]).to eq(10)
      end
    end

    context 'with multiple countries' do
      let(:raw_stats) do
        [
          {
            'country' => 'US',
            'unique_visits' => 100,
            'unique_users' => 50,
            'events_count' => 200,
            'visit_podcast_count' => 10,
            'first_event' => Time.new(2024, 1, 1),
            'last_event' => Time.new(2024, 1, 31)
          },
          {
            'country' => 'GB',
            'unique_visits' => 50,
            'unique_users' => 25,
            'events_count' => 100,
            'visit_podcast_count' => 5,
            'first_event' => Time.new(2024, 1, 5),
            'last_event' => Time.new(2024, 1, 20)
          }
        ]
      end

      it 'sums total visits across countries' do
        result = described_class.format_country_stats(raw_stats)
        expect(result[:total_visits]).to eq(150)
      end

      it 'counts all countries' do
        result = described_class.format_country_stats(raw_stats)
        expect(result[:country_count]).to eq(2)
      end

      it 'sums podcast listens across countries' do
        result = described_class.format_country_stats(raw_stats)
        expect(result[:total_podcast_listens]).to eq(15)
      end

      it 'sorts by unique_visits descending' do
        result = described_class.format_country_stats(raw_stats)
        visits = result[:stats].map { |s| s[:unique_visits] }
        expect(visits).to eq([100, 50])
      end
    end

    context 'with duplicate country entries (same ISO)' do
      let(:raw_stats) do
        [
          {
            'country' => 'US',
            'unique_visits' => 100,
            'unique_users' => 50,
            'events_count' => 200,
            'visit_podcast_count' => 10,
            'first_event' => Time.new(2024, 1, 1),
            'last_event' => Time.new(2024, 1, 15)
          },
          {
            'country' => 'United States',
            'unique_visits' => 50,
            'unique_users' => 25,
            'events_count' => 100,
            'visit_podcast_count' => 5,
            'first_event' => Time.new(2024, 1, 10),
            'last_event' => Time.new(2024, 1, 31)
          }
        ]
      end

      it 'merges entries with same ISO code' do
        result = described_class.format_country_stats(raw_stats)
        expect(result[:country_count]).to eq(1)
      end

      it 'sums numeric values' do
        result = described_class.format_country_stats(raw_stats)
        us_stats = result[:stats].first
        expect(us_stats[:unique_visits]).to eq(150)
        expect(us_stats[:unique_users]).to eq(75)
        expect(us_stats[:events_count]).to eq(300)
      end

      it 'takes earliest first_event' do
        result = described_class.format_country_stats(raw_stats)
        us_stats = result[:stats].first
        expect(us_stats[:first_event]).to eq(Time.new(2024, 1, 1))
      end

      it 'takes latest last_event' do
        result = described_class.format_country_stats(raw_stats)
        us_stats = result[:stats].first
        expect(us_stats[:last_event]).to eq(Time.new(2024, 1, 31))
      end
    end

    context 'with unknown country' do
      let(:raw_stats) do
        [{
          'country' => 'Unknown',
          'unique_visits' => 10,
          'unique_users' => 5,
          'events_count' => 20,
          'visit_podcast_count' => 0,
          'first_event' => Time.new(2024, 1, 1),
          'last_event' => Time.new(2024, 1, 31)
        }]
      end

      it 'handles Unknown country' do
        result = described_class.format_country_stats(raw_stats)
        unknown = result[:stats].first

        expect(unknown[:name]).to eq('Unknown')
        expect(unknown[:iso2]).to be_nil
        expect(unknown[:iso3]).to be_nil
      end
    end

    context 'with equal unique_visits' do
      let(:raw_stats) do
        [
          { 'country' => 'DE', 'unique_visits' => 50, 'unique_users' => 0, 'events_count' => 0,
            'visit_podcast_count' => 0, 'first_event' => nil, 'last_event' => nil },
          { 'country' => 'AU', 'unique_visits' => 50, 'unique_users' => 0, 'events_count' => 0,
            'visit_podcast_count' => 0, 'first_event' => nil, 'last_event' => nil }
        ]
      end

      it 'sorts alphabetically by name as secondary sort' do
        result = described_class.format_country_stats(raw_stats)
        names = result[:stats].map { |s| s[:name] }
        expect(names).to eq(%w[Australia Germany])
      end
    end
  end

  describe '.api_row' do
    let(:row) do
      {
        iso2: 'US',
        iso3: 'USA',
        name: 'United States',
        unique_visits: 100,
        unique_users: 50,
        events_count: 200,
        visit_podcast_count: 10,
        first_event: Time.new(2024, 1, 1, 12, 0, 0),
        last_event: Time.new(2024, 1, 31, 18, 0, 0)
      }
    end

    it 'formats country as nested hash' do
      result = described_class.api_row(row)
      expect(result[:country]).to eq(iso2: 'US', iso3: 'USA', name: 'United States')
    end

    it 'formats metrics as nested hash' do
      result = described_class.api_row(row)
      expect(result[:metrics]).to eq(
        unique_visits: 100,
        unique_users: 50,
        events_count: 200,
        visit_podcast_count: 10
      )
    end

    it 'formats timestamps as ISO8601' do
      result = described_class.api_row(row)
      expect(result[:first_event]).to match(/^2024-01-01T12:00:00/)
      expect(result[:last_event]).to match(/^2024-01-31T18:00:00/)
    end

    context 'with nil timestamps' do
      let(:row_without_times) do
        {
          iso2: 'US',
          iso3: 'USA',
          name: 'United States',
          unique_visits: 0,
          unique_users: 0,
          events_count: 0,
          visit_podcast_count: 0,
          first_event: nil,
          last_event: nil
        }
      end

      it 'handles nil timestamps gracefully' do
        result = described_class.api_row(row_without_times)
        expect(result[:first_event]).to be_nil
        expect(result[:last_event]).to be_nil
      end
    end
  end

  describe '.api_metrics' do
    let(:row) do
      {
        unique_visits: 100,
        unique_users: 50,
        events_count: 200,
        visit_podcast_count: 10
      }
    end

    it 'extracts metric values as integers' do
      result = described_class.api_metrics(row)
      expect(result).to eq(
        unique_visits: 100,
        unique_users: 50,
        events_count: 200,
        visit_podcast_count: 10
      )
    end

    context 'with string values' do
      let(:row_with_strings) do
        {
          unique_visits: '100',
          unique_users: '50',
          events_count: '200',
          visit_podcast_count: '10'
        }
      end

      it 'converts string values to integers' do
        result = described_class.api_metrics(row_with_strings)
        expect(result[:unique_visits]).to eq(100)
        expect(result[:unique_visits]).to be_an(Integer)
      end
    end
  end
end
