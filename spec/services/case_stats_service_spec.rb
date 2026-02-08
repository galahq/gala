# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CaseStatsService do
  describe '.resolve_country' do
    it 'returns Unknown for nil/blank values' do
      expect(described_class.resolve_country(nil)).to eq(
        iso2: nil,
        iso3: nil,
        name: 'Unknown'
      )

      expect(described_class.resolve_country('')).to eq(
        iso2: nil,
        iso3: nil,
        name: 'Unknown'
      )
    end

    it 'resolves ISO2 values' do
      expect(described_class.resolve_country('US')).to eq(
        iso2: 'US',
        iso3: 'USA',
        name: 'United States'
      )
    end

    it 'resolves ISO3 values' do
      expect(described_class.resolve_country('USA')).to eq(
        iso2: 'US',
        iso3: 'USA',
        name: 'United States'
      )
    end

    it 'resolves known english country names' do
      expect(described_class.resolve_country('United States')).to eq(
        iso2: 'US',
        iso3: 'USA',
        name: 'United States'
      )
    end

    it 'keeps unknown free-form country names' do
      expect(described_class.resolve_country('Unknown Country')).to eq(
        iso2: nil,
        iso3: nil,
        name: 'Unknown Country'
      )
    end
  end

  describe '.merge_stats' do
    it 'merges same country rows and keeps first/last event range' do
      raw = [
        {
          'country' => 'US',
          'unique_visits' => 10,
          'unique_users' => 7,
          'events_count' => 20,
          'visit_podcast_count' => 4,
          'first_event' => Time.zone.parse('2024-01-05'),
          'last_event' => Time.zone.parse('2024-01-08')
        },
        {
          'country' => 'US',
          'unique_visits' => 15,
          'unique_users' => 9,
          'events_count' => 30,
          'visit_podcast_count' => 6,
          'first_event' => Time.zone.parse('2024-01-01'),
          'last_event' => Time.zone.parse('2024-01-10')
        }
      ]

      merged = described_class.merge_stats(raw)

      expect(merged.length).to eq(1)
      expect(merged.first).to include(
        iso2: 'US',
        iso3: 'USA',
        name: 'United States',
        unique_visits: 25,
        unique_users: 16,
        events_count: 50,
        visit_podcast_count: 10
      )
      expect(merged.first[:first_event]).to eq(Time.zone.parse('2024-01-01'))
      expect(merged.first[:last_event]).to eq(Time.zone.parse('2024-01-10'))
    end

    it 'aggregates nil/blank/Unknown countries into one Unknown bucket' do
      raw = [
        { 'country' => nil, 'unique_visits' => 2 },
        { 'country' => '', 'unique_visits' => 3 },
        { 'country' => 'Unknown', 'unique_visits' => 4 }
      ]

      merged = described_class.merge_stats(raw)

      expect(merged.length).to eq(1)
      expect(merged.first[:name]).to eq('Unknown')
      expect(merged.first[:unique_visits]).to eq(9)
    end
  end

  describe '.format_country_stats' do
    let(:raw) do
      [
        {
          'country' => 'US',
          'unique_visits' => 20,
          'unique_users' => 10,
          'events_count' => 40,
          'deployments_count' => 2,
          'visit_podcast_count' => 8
        },
        {
          'country' => 'CA',
          'unique_visits' => 5,
          'unique_users' => 3,
          'events_count' => 9,
          'deployments_count' => 1,
          'visit_podcast_count' => 2
        }
      ]
    end

    it 'returns sorted stats totals from merged rows' do
      result = described_class.format_country_stats(raw, include_stats: true)

      expect(result[:stats].map { |row| row[:iso2] }).to eq(%w[US CA])
      expect(result[:total_visits]).to eq(25)
      expect(result[:country_count]).to eq(2)
      expect(result[:total_deployments]).to eq(2)
      expect(result[:total_podcast_listens]).to eq(10)
    end

    it 'can skip returning stats while keeping totals' do
      result = described_class.format_country_stats(raw, include_stats: false)

      expect(result[:stats]).to eq([])
      expect(result[:total_visits]).to eq(25)
      expect(result[:country_count]).to eq(2)
    end
  end
end
