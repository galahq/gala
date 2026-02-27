# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Cases::StatsSerializer do
  let(:kase) { create(:case) }
  let(:reader) { create(:reader) }
  let(:visit) { create(:visit, user: reader, country: 'US') }
  let(:service) { CaseStatsService.new(kase, from: '2024-01-01', to: '2024-12-31') }

  before do
    kase.update!(created_at: Date.new(2023, 1, 1))
    Rails.cache.clear
  end

  subject(:serializer) { described_class.new(service) }

  describe '#as_json' do
    context 'with no events' do
      it 'returns hash with data and meta keys' do
        result = serializer.as_json
        expect(result).to have_key(:data)
        expect(result).to have_key(:meta)
      end

      it 'returns empty data array' do
        result = serializer.as_json
        expect(result[:data]).to eq([])
      end

      it 'includes meta with zero totals' do
        result = serializer.as_json
        expect(result[:meta][:total_visits]).to eq(0)
        expect(result[:meta][:country_count]).to eq(0)
        expect(result[:meta][:total_podcast_listens]).to eq(0)
      end

      it 'includes date range in meta' do
        result = serializer.as_json
        expect(result[:meta][:from]).to eq('2024-01-01')
        expect(result[:meta][:to]).to eq('2024-12-31')
      end
    end

    context 'with events' do
      before do
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: Date.new(2024, 6, 15))
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_podcast',
                            time: Date.new(2024, 6, 15))
      end

      it 'returns data array with country stats' do
        result = serializer.as_json
        expect(result[:data]).to be_an(Array)
        expect(result[:data].length).to eq(1)
      end

      it 'formats each data item with expected structure' do
        result = serializer.as_json
        item = result[:data].first

        expect(item).to have_key(:country)
        expect(item).to have_key(:metrics)
        expect(item).to have_key(:first_event)
        expect(item).to have_key(:last_event)
      end

      it 'includes country details' do
        result = serializer.as_json
        country = result[:data].first[:country]

        expect(country[:iso2]).to eq('US')
        expect(country[:iso3]).to eq('USA')
        expect(country[:name]).to eq('United States')
      end

      it 'includes metrics' do
        result = serializer.as_json
        metrics = result[:data].first[:metrics]

        expect(metrics[:unique_visits]).to eq(1)
        expect(metrics[:unique_users]).to eq(1)
        expect(metrics[:events_count]).to eq(2)
        expect(metrics[:visit_podcast_count]).to eq(1)
      end

      it 'includes accurate meta totals' do
        result = serializer.as_json
        meta = result[:meta]

        expect(meta[:total_visits]).to eq(1)
        expect(meta[:country_count]).to eq(1)
        expect(meta[:total_podcast_listens]).to eq(1)
      end
    end

    context 'with multiple countries' do
      let(:gb_visit) { create(:visit, user: create(:reader), country: 'GB') }

      before do
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: Date.new(2024, 6, 15))
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: Date.new(2024, 6, 16))
        create(:ahoy_event, visit: gb_visit, user: gb_visit.user, case_id: kase.id, name: 'visit_case',
                            time: Date.new(2024, 6, 15))
      end

      it 'includes all countries in data' do
        result = serializer.as_json
        countries = result[:data].map { |d| d[:country][:iso2] }

        expect(countries).to contain_exactly('US', 'GB')
      end

      it 'calculates correct totals in meta' do
        result = serializer.as_json

        expect(result[:meta][:total_visits]).to eq(2)
        expect(result[:meta][:country_count]).to eq(2)
      end
    end
  end

  describe '#to_json' do
    it 'is aliased to as_json' do
      expect(serializer.to_json).to eq(serializer.as_json)
    end
  end

  describe 'JSON output structure' do
    before do
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                          time: Date.new(2024, 6, 15))
    end

    it 'produces valid JSON when serialized' do
      json_string = serializer.as_json.to_json
      expect { JSON.parse(json_string) }.not_to raise_error
    end

    it 'maintains structure after JSON round-trip' do
      json_string = serializer.as_json.to_json
      parsed = JSON.parse(json_string, symbolize_names: true)

      expect(parsed[:data]).to be_an(Array)
      expect(parsed[:meta]).to be_a(Hash)
      expect(parsed[:meta][:from]).to eq('2024-01-01')
    end
  end
end
