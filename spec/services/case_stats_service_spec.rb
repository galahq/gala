# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CaseStatsService do
  let(:kase) { create(:case) }
  let(:reader) { create(:reader) }
  let(:visit) { create(:visit, user: reader, country: 'US', started_at: Time.current) }

  before do
    Rails.cache.clear
  end

  describe '#initialize' do
    context 'with no date parameters' do
      subject(:service) { described_class.new(kase) }

      it 'sets from_date to case created_at date' do
        expect(service.from_date).to eq(kase.created_at.to_date)
      end

      it 'sets to_date to current date' do
        expect(service.to_date).to eq(Date.current)
      end
    end

    context 'with ISO8601 date strings' do
      subject(:service) { described_class.new(kase, from: '2024-01-15', to: '2024-06-30') }

      before do
        kase.update!(created_at: Date.new(2024, 1, 1))
      end

      it 'parses from date correctly' do
        expect(service.from_date).to eq(Date.new(2024, 1, 15))
      end

      it 'parses to date correctly' do
        expect(service.to_date).to eq(Date.new(2024, 6, 30))
      end
    end

    context 'with Date objects' do
      let(:from_date) { Date.new(2024, 3, 1) }
      let(:to_date) { Date.new(2024, 3, 31) }

      subject(:service) { described_class.new(kase, from: from_date, to: to_date) }

      before do
        kase.update!(created_at: Date.new(2024, 1, 1))
      end

      it 'accepts Date objects for from' do
        expect(service.from_date).to eq(from_date)
      end

      it 'accepts Date objects for to' do
        expect(service.to_date).to eq(to_date)
      end
    end

    context 'with invalid date strings' do
      subject(:service) { described_class.new(kase, from: 'invalid', to: 'also-invalid') }

      it 'falls back to case created_at for from_date' do
        expect(service.from_date).to eq(kase.created_at.to_date)
      end

      it 'falls back to current date for to_date' do
        expect(service.to_date).to eq(Date.current)
      end
    end

    context 'when from_date is before case creation' do
      subject(:service) { described_class.new(kase, from: '2020-01-01') }

      before do
        kase.update!(created_at: Date.new(2024, 1, 1))
      end

      it 'clamps from_date to case created_at' do
        expect(service.from_date).to eq(Date.new(2024, 1, 1))
      end
    end

    context 'when to_date is before from_date' do
      subject(:service) { described_class.new(kase, from: '2024-06-01', to: '2024-01-01') }

      before do
        kase.update!(created_at: Date.new(2024, 1, 1))
      end

      it 'clamps to_date to from_date' do
        expect(service.to_date).to eq(Date.new(2024, 6, 1))
      end
    end
  end

  describe '#country_stats' do
    subject(:service) { described_class.new(kase) }

    context 'with no events' do
      it 'returns empty stats' do
        expect(service.country_stats[:stats]).to be_empty
      end

      it 'returns zero totals' do
        expect(service.country_stats[:total_visits]).to eq(0)
        expect(service.country_stats[:country_count]).to eq(0)
        expect(service.country_stats[:total_podcast_listens]).to eq(0)
      end
    end

    context 'with events from multiple countries' do
      let(:us_visit) { create(:visit, user: reader, country: 'US', started_at: Time.current) }
      let(:gb_reader) { create(:reader) }
      let(:gb_visit) { create(:visit, user: gb_reader, country: 'GB', started_at: Time.current) }

      before do
        create(:ahoy_event, visit: us_visit, user: reader, case_id: kase.id, name: 'visit_case', time: Time.current)
        create(:ahoy_event, visit: us_visit, user: reader, case_id: kase.id, name: 'visit_page', time: Time.current)
        create(:ahoy_event, visit: gb_visit, user: gb_reader, case_id: kase.id, name: 'visit_case', time: Time.current)
      end

      it 'aggregates stats by country' do
        stats = service.country_stats[:stats]
        expect(stats.length).to eq(2)
      end

      it 'calculates total visits' do
        expect(service.country_stats[:total_visits]).to eq(2)
      end

      it 'calculates country count' do
        expect(service.country_stats[:country_count]).to eq(2)
      end

      it 'sorts by unique_visits descending' do
        stats = service.country_stats[:stats]
        visits = stats.map { |s| s[:unique_visits] }
        expect(visits).to eq(visits.sort.reverse)
      end
    end

    context 'with podcast events' do
      before do
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_podcast', time: Time.current)
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_podcast', time: Time.current)
      end

      it 'counts podcast listens' do
        expect(service.country_stats[:total_podcast_listens]).to eq(2)
      end
    end
  end

  describe '#stats_rows' do
    subject(:service) { described_class.new(kase) }

    before do
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case', time: Time.current)
    end

    it 'returns the stats array from country_stats' do
      expect(service.stats_rows).to eq(service.country_stats[:stats])
    end
  end

  describe '#api_data' do
    subject(:service) { described_class.new(kase) }

    before do
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case', time: Time.current)
    end

    it 'returns formatted API rows' do
      api_data = service.api_data
      expect(api_data).to be_an(Array)
      expect(api_data.first).to include(:country, :metrics, :first_event, :last_event)
    end

    it 'formats country as nested hash' do
      country = service.api_data.first[:country]
      expect(country).to include(:iso2, :iso3, :name)
    end

    it 'formats metrics as nested hash' do
      metrics = service.api_data.first[:metrics]
      expect(metrics).to include(:unique_visits, :unique_users, :events_count, :visit_podcast_count)
    end

    it 'formats timestamps as ISO8601' do
      first_event = service.api_data.first[:first_event]
      expect(first_event).to match(/^\d{4}-\d{2}-\d{2}T/)
    end
  end

  describe '#total_visits' do
    subject(:service) { described_class.new(kase) }

    before do
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case', time: Time.current)
    end

    it 'returns total unique visits' do
      expect(service.total_visits).to eq(1)
    end
  end

  describe '#country_count' do
    subject(:service) { described_class.new(kase) }

    before do
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case', time: Time.current)
    end

    it 'returns number of countries' do
      expect(service.country_count).to eq(1)
    end
  end

  describe '#total_podcast_listens' do
    subject(:service) { described_class.new(kase) }

    before do
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_podcast', time: Time.current)
    end

    it 'returns total podcast listens' do
      expect(service.total_podcast_listens).to eq(1)
    end
  end

  describe '#date_range' do
    subject(:service) { described_class.new(kase, from: '2024-01-01', to: '2024-12-31') }

    before do
      kase.update!(created_at: Date.new(2023, 1, 1))
    end

    it 'returns from and to dates' do
      expect(service.date_range).to eq(from: Date.new(2024, 1, 1), to: Date.new(2024, 12, 31))
    end
  end

  describe '#cache_key' do
    subject(:service) { described_class.new(kase, from: '2024-01-01', to: '2024-12-31') }

    before do
      kase.update!(created_at: Date.new(2023, 1, 1))
    end

    it 'includes case id' do
      expect(service.cache_key).to include(kase.id.to_s)
    end

    it 'includes date range' do
      expect(service.cache_key).to include('2024-01-01', '2024-12-31')
    end

    it 'includes event version key' do
      event_key = Ahoy::Event.cache_key(kase: kase)
      expect(service.cache_key).to include(event_key)
    end

    it 'changes when new events are added' do
      original_key = service.cache_key

      # Create a new service instance to get fresh cache_key
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case', time: Time.current)
      new_service = described_class.new(kase, from: '2024-01-01', to: '2024-12-31')

      expect(new_service.cache_key).not_to eq(original_key)
    end
  end

  describe 'caching behavior' do
    subject(:service) { described_class.new(kase) }

    # Use memory store for caching tests (test env uses null_store by default)
    around do |example|
      original_cache = Rails.cache
      Rails.cache = ActiveSupport::Cache::MemoryStore.new
      example.run
    ensure
      Rails.cache = original_cache
    end

    before do
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case', time: Time.current)
    end

    it 'caches country_stats results' do
      service.country_stats

      expect(Rails.cache.exist?(service.cache_key)).to be true
    end

    it 'returns cached data on subsequent calls' do
      first_result = service.country_stats

      new_service = described_class.new(kase)
      second_result = new_service.country_stats

      expect(second_result).to eq(first_result)
    end

    it 'memoizes country_stats within the same instance' do
      first_result = service.country_stats
      second_result = service.country_stats

      expect(first_result).to equal(second_result)
    end
  end
end
