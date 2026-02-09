# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Cases::StatsController do
  render_views

  let(:reader) { create :reader }
  let(:kase) { create :case, :published }

  describe 'GET #show' do
    context 'as an editor' do
      before do
        reader.add_role :editor
        sign_in reader
      end

      it 'renders html successfully' do
        get :show, params: { case_slug: kase.slug }, format: :html

        expect(response).to have_http_status(:success)
      end

      it 'includes locales with case locale first in html data attributes' do
        create :case, :published, translation_base: kase, locale: :fr
        create :case, :published, translation_base: kase, locale: :es

        get :show, params: { case_slug: kase.slug }, format: :html

        document = Nokogiri::HTML(response.body)
        mount_node = document.at_css('[data-controller="case-stats"]')
        locales = JSON.parse(mount_node['data-locales'])

        expect(locales.first).to eq(kase.locale)
        expect(locales).to include('fr', 'es')
      end

      it 'returns the new json envelope' do
        allow(controller).to receive(:data_payload).and_return([
          {
            country: { iso2: 'US', iso3: 'USA', name: 'US' },
            metrics: {
              unique_visits: 10,
              unique_users: 8,
              events_count: 22,
              visit_podcast_count: 4
            },
            first_event: '2024-01-01T00:00:00Z',
            last_event: '2024-01-07T00:00:00Z'
          }
        ])

        get :show, params: { case_slug: kase.slug }, format: :json

        expect(response).to have_http_status(:success)
        expect(response.content_type).to include('application/json')

        json = JSON.parse(response.body)
        expect(json.keys).to eq(['data'])
        expect(json['data']).to be_an(Array)
        expect(json['data'].first['country']['iso2']).to eq('US')
      end

      it 'returns a csv export' do
        allow(controller).to receive(:data_payload).and_return([
          {
            country: { iso2: 'US', iso3: 'USA', name: 'US' },
            metrics: {
              unique_visits: 10,
              unique_users: 8,
              events_count: 22,
              visit_podcast_count: 4
            },
            first_event: '2024-01-01T00:00:00Z',
            last_event: '2024-01-07T00:00:00Z'
          }
        ])

        get :show, params: { case_slug: kase.slug }, format: :csv

        expect(response).to have_http_status(:success)
        expect(response.content_type).to include('text/csv')
        expect(response.headers['Content-Disposition']).to include('attachment')
        expect(response.body).to include('Country')
        expect(response.body).to include('Total')
      end
    end

    context 'when unauthorized' do
      before { sign_in reader }

      it 'redirects to 403' do
        get :show, params: { case_slug: kase.slug }, format: :html

        expect(response).to redirect_to('/403')
      end
    end
  end

  describe '#stats_range' do
    before do
      controller.instance_variable_set(:@case, kase)
    end

    it 'defaults from to case creation date when from param is missing' do
      travel_to(Time.zone.parse('2024-07-18 11:00:00')) do
        controller.params = ActionController::Parameters.new(case_slug: kase.slug)

        range = controller.send(:stats_range)

        expect(range[:from_date]).to eq(kase.created_at.to_date)
        expect(range[:to_date]).to eq(Time.zone.today)
      end
    end

    it 'parses explicit from/to params as dates' do
      controller.params = ActionController::Parameters.new(
        case_slug: kase.slug,
        from: '2024-01-02',
        to: '2024-01-05'
      )

      range = controller.send(:stats_range)

      expect(range[:from_date]).to eq(Date.iso8601('2024-01-02'))
      expect(range[:to_date]).to eq(Date.iso8601('2024-01-05'))
    end

    it 'clamps to_date when it is earlier than from_date' do
      controller.params = ActionController::Parameters.new(
        case_slug: kase.slug,
        from: '2024-01-05',
        to: '2024-01-02'
      )

      range = controller.send(:stats_range)

      expect(range[:from_date]).to eq(Date.iso8601('2024-01-05'))
      expect(range[:to_date]).to eq(Date.iso8601('2024-01-05'))
    end
  end

  describe '#bindings' do
    before do
      controller.instance_variable_set(:@case, kase)
      controller.params = ActionController::Parameters.new(
        case_slug: kase.slug,
        from: '2024-01-02',
        to: '2024-01-05'
      )
    end

    it 'builds query bindings for case and date range' do
      bindings = controller.send(:bindings)

      expect(bindings.length).to eq(3)
      expect(bindings[0].value).to eq(kase.id)
      expect(bindings[1].value).to eq(Date.iso8601('2024-01-02'))
      expect(bindings[2].value).to eq(Date.iso8601('2024-01-05'))
    end
  end
end
