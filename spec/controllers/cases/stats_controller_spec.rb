# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Cases::StatsController do
  let(:reader) { create :reader }
  let(:kase) { create :case, :published }

  before do
    sign_in reader
  end

  describe 'GET #show' do
    context 'with HTML format' do
      it 'renders the show template' do
        get :show, params: { case_slug: kase.slug }

        expect(response).to have_http_status(:success)
        expect(response).to render_template(:show)
      end

      it 'sets the case instance variable' do
        get :show, params: { case_slug: kase.slug }

        expect(assigns(:case)).to eq(kase)
      end
    end

    context 'with JSON format' do
      let(:mock_stats_data) do
        {
          by_event: [],
          formatted: { stats: [], percentiles: [], total_visits: 0, country_count: 0, total_deployments: 0,
                       total_podcast_listens: 0 },
          summary: {
            total_visits: 0,
            country_count: 0,
            total_deployments: 0,
            total_podcast_listens: 0,
            case_published_at: nil,
            case_locales: 'en',
            percentiles: []
          }
        }
      end

      before do
        allow(controller).to receive(:stats_data).and_return(mock_stats_data)
      end

      it 'returns JSON response' do
        get :show, params: { case_slug: kase.slug }, format: :json

        expect(response).to have_http_status(:success)
        expect(response.content_type).to include('application/json')
      end

      it 'returns the correct JSON structure' do
        get :show, params: { case_slug: kase.slug }, format: :json

        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('by_event')
        expect(json_response).to have_key('formatted')
        expect(json_response).to have_key('summary')
      end
    end

    context 'with CSV format' do
      it 'returns CSV response' do
        get :show, params: { case_slug: kase.slug }, format: :csv

        expect(response).to have_http_status(:success)
        expect(response.content_type).to include('text/csv')
        expect(response.headers['Content-Disposition']).to include('attachment')
        expect(response.headers['Content-Disposition']).to include('case-stats-')
      end
    end

    context 'when case is not found' do
      it 'raises ActiveRecord::RecordNotFound' do
        expect do
          get :show, params: { case_slug: 'non-existent-case' }
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe '#set_case' do
    it 'finds and decorates the case' do
      controller.params = { case_slug: kase.slug }
      controller.send(:set_case)

      expect(assigns(:case)).to eq(kase)
      expect(assigns(:case)).to be_decorated
    end

    it 'authorizes the case' do
      allow(controller).to receive(:authorize).and_call_original

      controller.params = { case_slug: kase.slug }
      controller.send(:set_case)

      expect(controller).to have_received(:authorize).with(kase)
    end
  end

  describe '#bindings' do
    let(:from_date) { '2023-01-01' }
    let(:to_date) { '2023-01-31' }

    it 'returns correct bindings with from and to params' do
      controller.params = { case_slug: kase.slug, from: from_date, to: to_date }

      bindings = controller.send(:bindings)

      expect(bindings.length).to eq(3)
      expect(bindings[0].value).to eq(kase.slug)
      expect(bindings[1].value).to eq(Time.zone.parse(from_date))
      expect(bindings[2].value).to eq(Time.zone.parse(to_date).end_of_day)
    end

    it 'uses case created_at when no from param' do
      controller.params = { case_slug: kase.slug, to: to_date }
      controller.instance_variable_set(:@case, kase)

      bindings = controller.send(:bindings)

      expect(bindings[1].value).to eq(kase.created_at)
    end

    it 'uses current time when no to param' do
      freeze_time = Time.zone.parse('2023-06-15 12:00:00')
      travel_to(freeze_time) do
        controller.params = { case_slug: kase.slug, from: from_date }
        controller.instance_variable_set(:@case, kase)

        bindings = controller.send(:bindings)

        expect(bindings[2].value).to eq(freeze_time.end_of_day)
      end
    end
  end

  describe '#stats_data' do
    let(:raw_data) { [{ 'country' => 'US', 'unique_visits' => 100 }] }
    let(:formatted_data) do
      {
        stats: [{ country: 'US', unique_visits: 100 }],
        percentiles: [],
        total_visits: 100,
        country_count: 1,
        total_deployments: 5,
        total_podcast_listens: 10
      }
    end

    before do
      allow(controller).to receive(:sql_query).and_return(raw_data)
      allow(CountryStatsService).to receive(:format_country_stats).and_return(formatted_data)
      controller.instance_variable_set(:@case, kase)
    end

    it 'calls sql_query and formats the data' do
      result = controller.send(:stats_data)

      expect(controller).to have_received(:sql_query)
      expect(CountryStatsService).to have_received(:format_country_stats).with(raw_data)

      expect(result[:by_event]).to eq(raw_data)
      expect(result[:formatted]).to eq(formatted_data)
      expect(result[:summary]).to have_key(:case_published_at)
      expect(result[:summary]).to have_key(:case_locales)
    end

    it 'includes case locales in summary' do
      allow(kase).to receive_message_chain(:translation_set, :pluck).and_return(%w[en fr])

      result = controller.send(:stats_data)

      expect(result[:summary][:case_locales]).to eq('en, fr')
    end
  end

  describe '#generate_csv' do
    let(:raw_data) { [{ 'country' => 'US', 'unique_visits' => 100 }] }
    let(:formatted_data) do
      {
        stats: [{
          name: 'United States',
          iso3: 'USA',
          percentile: 100,
          unique_visits: 100,
          unique_users: 50,
          events_count: 200,
          first_event: Time.zone.parse('2023-01-01'),
          last_event: Time.zone.parse('2023-01-31')
        }],
        percentiles: [{ percentile: 100, value: 100 }]
      }
    end

    before do
      allow(controller).to receive(:sql_query).and_return(raw_data)
      allow(CountryStatsService).to receive(:format_country_stats).and_return(formatted_data)
    end

    it 'generates CSV with correct headers' do
      csv_content = controller.send(:generate_csv)

      lines = csv_content.split("\n")
      headers = lines.first.split(',')

      expect(headers).to include('Country')
      expect(headers).to include('ISO Code')
      expect(headers).to include('Percentile')
      expect(headers).to include('Unique Visitors')
      expect(headers).to include('Unique Users')
      expect(headers).to include('Total Events')
      expect(headers).to include('First Visit')
      expect(headers).to include('Last Visit')
    end

    it 'includes data rows in CSV' do
      csv_content = controller.send(:generate_csv)

      lines = csv_content.split("\n")
      expect(lines.length).to eq(2) # header + 1 data row

      data_row = lines.last.split(',')
      expect(data_row).to include('United States')
      expect(data_row).to include('USA')
      expect(data_row).to include('100%')
      expect(data_row).to include('100')
      expect(data_row).to include('50')
      expect(data_row).to include('200')
    end
  end

  describe '#get_percentile_range' do
    it 'returns single percentile when no percentiles' do
      result = controller.send(:get_percentile_range, 50, [])
      expect(result).to eq('50%')
    end

    it 'returns percentile range' do
      percentiles = [
        { percentile: 0, value: 0 },
        { percentile: 25, value: 25 },
        { percentile: 50, value: 50 },
        { percentile: 75, value: 75 },
        { percentile: 100, value: 100 }
      ]

      expect(controller.send(:get_percentile_range, 25, percentiles)).to eq('25-50%')
      expect(controller.send(:get_percentile_range, 75, percentiles)).to eq('75-100%')
      expect(controller.send(:get_percentile_range, 100, percentiles)).to eq('100%')
    end

    it 'returns single percentile when index not found' do
      percentiles = [{ percentile: 50, value: 50 }]
      result = controller.send(:get_percentile_range, 25, percentiles)
      expect(result).to eq('25%')
    end
  end
end
