# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CaseStatsService::Query do
  let(:kase) { create(:case) }
  let(:reader) { create(:reader) }
  let(:visit) { create(:visit, user: reader, country: 'US') }
  let(:time_range) do
    {
      from_time: 1.week.ago.beginning_of_day,
      to_time: Time.current.end_of_day
    }
  end

  subject(:query) { described_class.new(kase, time_range) }

  describe '#execute' do
    context 'with no events' do
      it 'returns empty array' do
        expect(query.execute).to eq([])
      end
    end

    context 'with events within time range' do
      before do
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: 2.days.ago)
      end

      it 'returns array of hashes' do
        result = query.execute
        expect(result).to be_an(Array)
        expect(result.length).to eq(1)
      end

      it 'includes country' do
        result = query.execute.first
        expect(result['country']).to eq('US')
      end

      it 'includes unique_visits' do
        result = query.execute.first
        expect(result['unique_visits']).to eq(1)
      end

      it 'includes unique_users' do
        result = query.execute.first
        expect(result['unique_users']).to eq(1)
      end

      it 'includes events_count' do
        result = query.execute.first
        expect(result['events_count']).to eq(1)
      end

      it 'includes first_event timestamp' do
        result = query.execute.first
        expect(result['first_event']).to be_a(Time)
      end

      it 'includes last_event timestamp' do
        result = query.execute.first
        expect(result['last_event']).to be_a(Time)
      end
    end

    context 'with events outside time range' do
      before do
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: 2.weeks.ago)
      end

      it 'excludes events outside range' do
        expect(query.execute).to eq([])
      end
    end

    context 'with podcast events' do
      before do
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_podcast',
                            time: 1.day.ago)
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: 1.day.ago)
      end

      it 'counts visit_podcast events separately' do
        result = query.execute.first
        expect(result['visit_podcast_count']).to eq(1)
        expect(result['events_count']).to eq(2)
      end
    end

    context 'with multiple countries' do
      let(:gb_visit) { create(:visit, user: create(:reader), country: 'GB') }

      before do
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: 1.day.ago)
        create(:ahoy_event, visit: gb_visit, user: gb_visit.user, case_id: kase.id, name: 'visit_case',
                            time: 1.day.ago)
      end

      it 'returns one row per country' do
        result = query.execute
        expect(result.length).to eq(2)
        countries = result.map { |r| r['country'] }
        expect(countries).to contain_exactly('US', 'GB')
      end

      it 'orders by unique_visits descending' do
        # Add more US events to ensure US has more visits
        create(:ahoy_event, visit: create(:visit, user: create(:reader), country: 'US'),
                            user: reader, case_id: kase.id, name: 'visit_case', time: 1.day.ago)

        result = query.execute
        expect(result.first['country']).to eq('US')
      end
    end

    context 'with invisible users' do
      let(:invisible_reader) { create(:reader, :invisible) }
      let(:invisible_visit) { create(:visit, user: invisible_reader, country: 'CA') }

      before do
        create(:ahoy_event, visit: invisible_visit, user: invisible_reader, case_id: kase.id,
                            name: 'visit_case', time: 1.day.ago)
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: 1.day.ago)
      end

      it 'excludes events from invisible users' do
        result = query.execute
        countries = result.map { |r| r['country'] }
        expect(countries).not_to include('CA')
        expect(countries).to include('US')
      end
    end

    context 'with events for different cases' do
      let(:other_case) { create(:case) }

      before do
        create(:ahoy_event, visit: visit, user: reader, case_id: kase.id, name: 'visit_case',
                            time: 1.day.ago)
        create(:ahoy_event, visit: visit, user: reader, case_id: other_case.id, name: 'visit_case',
                            time: 1.day.ago)
      end

      it 'only includes events for the specified case' do
        result = query.execute
        expect(result.length).to eq(1)
        expect(result.first['events_count']).to eq(1)
      end
    end

    context 'with blank or empty country' do
      let(:blank_visit) { create(:visit, user: create(:reader), country: '') }
      let(:nil_visit) { create(:visit, user: create(:reader), country: nil) }

      before do
        create(:ahoy_event, visit: blank_visit, user: blank_visit.user, case_id: kase.id,
                            name: 'visit_case', time: 1.day.ago)
        create(:ahoy_event, visit: nil_visit, user: nil_visit.user, case_id: kase.id,
                            name: 'visit_case', time: 1.day.ago)
      end

      it 'treats blank countries as Unknown' do
        result = query.execute
        unknown_row = result.find { |r| r['country'] == 'Unknown' }
        expect(unknown_row).to be_present
        expect(unknown_row['unique_visits']).to eq(2)
      end
    end
  end
end
