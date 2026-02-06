# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Cases::StatsController do
  let(:reader) { create :reader }
  let(:kase) { create :case, :published }

  describe 'GET #show' do
    context 'as an editor' do
      before do
        reader.add_role :editor
        sign_in reader
      end

      context 'with HTML format' do
        it 'renders the show template' do
          get :show, params: { case_slug: kase.slug }, format: :html

          expect(response).to have_http_status(:success)
        end

        it 'sets the case instance variable' do
          get :show, params: { case_slug: kase.slug }, format: :html

          assigned_case = controller.instance_variable_get(:@case)
          expect(assigned_case.id).to eq(kase.id)
        end
      end

      context 'with JSON format' do
        let(:mock_stats_data) do
          {
            summary: {
              total_visits: 0,
              country_count: 0,
              total_podcast_listens: 0
            },
            countries: [],
            bins: {
              metric: 'unique_visits',
              bin_count: 0,
              bins: []
            },
            meta: {},
            range: {}
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
          expect(json_response).to have_key('summary')
          expect(json_response).to have_key('countries')
          expect(json_response).to have_key('bins')
          expect(json_response).to have_key('meta')
          expect(json_response).to have_key('range')
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
    end

    context 'as a case editor' do
      before do
        kase.editorships.create editor: reader
        sign_in reader
      end

      it 'renders the show template' do
        get :show, params: { case_slug: kase.slug }, format: :html

        expect(response).to have_http_status(:success)
      end
    end

    context 'as a library manager' do
      let(:library) { create :library }

      before do
        kase.update!(library: library)
        reader.libraries << library
        sign_in reader
      end

      it 'renders the show template' do
        get :show, params: { case_slug: kase.slug }, format: :html

        expect(response).to have_http_status(:success)
      end
    end

    context 'when unauthorized' do
      before do
        sign_in reader
      end

      it 'redirects to 403' do
        get :show, params: { case_slug: kase.slug }, format: :html

        expect(response).to redirect_to '/403'
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
      allow(controller).to receive(:authorize).and_return(true)
      controller.params = { case_slug: kase.slug }
      controller.send(:set_case)

      assigned_case = controller.instance_variable_get(:@case)
      expect(assigned_case.id).to eq(kase.id)
      expect(assigned_case).to be_decorated
    end

    it 'authorizes the case' do
      allow(controller).to receive(:authorize).and_return(true)

      controller.params = { case_slug: kase.slug }
      controller.send(:set_case)

      expect(controller).to have_received(:authorize)
    end
  end

  describe '#bindings' do
    let(:from_date) { '2023-01-01' }
    let(:to_date) { '2023-01-31' }

    before do
      controller.instance_variable_set(:@case, kase)
    end

    it 'returns correct bindings with from and to params' do
      controller.params = { case_slug: kase.slug, from: from_date, to: to_date }

      bindings = controller.send(:bindings)

      expect(bindings.length).to eq(3)
      expect(bindings[0].value).to eq(kase.id)
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
        stats: [{
          iso2: 'US',
          iso3: 'USA',
          name: 'United States',
          unique_visits: 100,
          unique_users: 50,
          events_count: 200,
          visit_podcast_count: 10,
          first_event: Time.zone.parse('2023-01-01'),
          last_event: Time.zone.parse('2023-01-31'),
          bin: 4
        }],
        bins: [],
        bin_count: 5,
        total_visits: 100,
        country_count: 1,
        total_podcast_listens: 10
      }
    end

    before do
      allow(controller).to receive(:sql_query).and_return(raw_data)
      allow(CountryStatsService).to receive(:format_country_stats).and_return(formatted_data)
      controller.instance_variable_set(:@case, kase)
    end

    it 'calls sql_query and formats the data' do
      controller.params = { case_slug: kase.slug }
      result = controller.send(:stats_data)

      expect(controller).to have_received(:sql_query)
      expect(CountryStatsService).to have_received(:format_country_stats)
        .with(raw_data, include_stats: true, include_bins: true)

      expect(result[:summary]).to have_key(:total_visits)
      expect(result[:summary]).to have_key(:country_count)
      expect(result[:summary]).to have_key(:total_podcast_listens)
      expect(result[:countries]).to be_a(Array)
      expect(result[:bins]).to have_key(:bins)
      expect(result[:meta]).to have_key(:case)
      expect(result[:range]).to have_key(:from)
    end

    it 'includes case locales in meta' do
      controller.params = { case_slug: kase.slug }
      allow(kase).to receive_message_chain(:translation_set, :pluck).and_return(%w[en fr])

      result = controller.send(:stats_data)

      expect(result[:meta][:case][:locales]).to eq(%w[en fr])
    end
  end

  describe '#generate_csv' do
    let(:raw_data) { [{ 'country' => 'US', 'unique_visits' => 100 }] }
    let(:countries) do
      [{
        country: {
          name: 'United States',
          iso3: 'USA'
        },
        metrics: {
          unique_visits: 100,
          unique_users: 50,
          events_count: 200
        },
        first_event: Time.zone.parse('2023-01-01'),
        last_event: Time.zone.parse('2023-01-31')
      }]
    end

    let(:mock_stats_data) do
      {
        countries: countries
      }
    end

    before do
      allow(controller).to receive(:stats_data).and_return(mock_stats_data)
    end

    it 'generates CSV with correct headers' do
      csv_content = controller.send(:generate_csv)

      lines = csv_content.split("\n")
      headers = lines.first.split(',')

      expect(headers).to include('Country')
      expect(headers).to include('Unique Visitors')
      expect(headers).to include('Unique Users')
      expect(headers).to include('Total Events')
      expect(headers).to include('First Visit')
      expect(headers).to include('Last Visit')
      expect(headers).not_to include('ISO Code')
      expect(headers).not_to include('Percentile')
    end

    it 'includes data rows in CSV' do
      csv_content = controller.send(:generate_csv)

      lines = csv_content.split("\n")
      expect(lines.length).to eq(3) # header + 1 data row + 1 totals row

      data_row = lines[1].split(',') # Second line is the data row
      expect(data_row).to include('United States')
      expect(data_row).to include('100')
      expect(data_row).to include('50')
      expect(data_row).to include('200')

      totals_row = lines.last.split(',') # Last line is the totals row
      expect(totals_row).to include('Total')
      expect(totals_row).to include('100') # total_visits
      expect(totals_row).to include('50')  # total_users
      expect(totals_row).to include('200') # total_events
    end

    context 'with multiple countries' do
      let(:countries) do
        [
          {
            country: {
              name: 'United States',
              iso3: 'USA'
            },
            metrics: {
              unique_visits: 100,
              unique_users: 50,
              events_count: 200
            },
            first_event: Time.zone.parse('2023-01-01'),
            last_event: Time.zone.parse('2023-01-31')
          },
          {
            country: {
              name: 'Canada',
              iso3: 'CAN'
            },
            metrics: {
              unique_visits: 80,
              unique_users: 40,
              events_count: 150
            },
            first_event: Time.zone.parse('2023-01-05'),
            last_event: Time.zone.parse('2023-01-25')
          }
        ]
      end

      it 'includes all countries in CSV' do
        csv_content = controller.send(:generate_csv)

        lines = csv_content.split("\n")
        expect(lines.length).to eq(4) # header + 2 data rows + 1 totals row

        # Check first country
        us_row = lines[1].split(',')
        expect(us_row).to include('United States')
        expect(us_row).to include('100')

        # Check second country
        ca_row = lines[2].split(',')
        expect(ca_row).to include('Canada')
        expect(ca_row).to include('80')

        # Check totals
        totals_row = lines.last.split(',')
        expect(totals_row).to include('Total')
        expect(totals_row).to include('180') # total_visits (100 + 80)
        expect(totals_row).to include('90')  # total_users (50 + 40)
        expect(totals_row).to include('350') # total_events (200 + 150)
      end
    end
  end
end
