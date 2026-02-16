# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Cases::StatsController, type: :controller do
  let(:library) { create(:library, slug: "stats-test-lib-#{SecureRandom.hex(4)}") }
  let(:kase) { create(:case, library: library, published_at: 1.day.ago) }
  let(:reader) { create(:reader, :editor) }
  let(:visit) { create(:visit, user: reader, country: 'US', started_at: Time.current) }

  before do
    Rails.cache.clear
    sign_in reader
  end

  describe 'GET #show' do
    context 'HTML format' do
      it 'returns http success' do
        get :show, params: { case_slug: kase.slug }

        expect(response).to have_http_status(:ok)
      end

      it 'returns HTML content type' do
        get :show, params: { case_slug: kase.slug }

        expect(response.content_type).to include('text/html')
      end

      context 'HTTP caching' do
        it 'sets ETag header' do
          get :show, params: { case_slug: kase.slug }

          expect(response.headers['ETag']).to be_present
        end

        it 'returns 304 Not Modified for unchanged content' do
          get :show, params: { case_slug: kase.slug }
          etag = response.headers['ETag']

          request.env['HTTP_IF_NONE_MATCH'] = etag
          get :show, params: { case_slug: kase.slug }

          expect(response).to have_http_status(:not_modified)
        end
      end
    end

    context 'JSON format' do
      it 'returns JSON response' do
        get :show, params: { case_slug: kase.slug }, format: :json

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('application/json')
      end

      it 'returns expected JSON structure' do
        get :show, params: { case_slug: kase.slug }, format: :json

        json = JSON.parse(response.body, symbolize_names: true)
        expect(json).to have_key(:data)
        expect(json).to have_key(:meta)
      end

      it 'includes meta with date range' do
        get :show, params: { case_slug: kase.slug }, format: :json

        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:meta][:from]).to be_present
        expect(json[:meta][:to]).to be_present
      end

      context 'with events' do
        before do
          create(:ahoy_event, visit: visit, user: reader, case_id: kase.id,
                              name: 'visit_case', time: Time.current)
          create(:ahoy_event, visit: visit, user: reader, case_id: kase.id,
                              name: 'visit_podcast', time: Time.current)
        end

        it 'returns country stats in data array' do
          get :show, params: { case_slug: kase.slug }, format: :json

          json = JSON.parse(response.body, symbolize_names: true)
          expect(json[:data].length).to eq(1)
          expect(json[:data].first[:country][:iso2]).to eq('US')
        end

        it 'includes correct metrics' do
          get :show, params: { case_slug: kase.slug }, format: :json

          json = JSON.parse(response.body, symbolize_names: true)
          metrics = json[:data].first[:metrics]
          expect(metrics[:unique_visits]).to eq(1)
          expect(metrics[:events_count]).to eq(2)
          expect(metrics[:visit_podcast_count]).to eq(1)
        end

        it 'includes correct meta totals' do
          get :show, params: { case_slug: kase.slug }, format: :json

          json = JSON.parse(response.body, symbolize_names: true)
          expect(json[:meta][:total_visits]).to eq(1)
          expect(json[:meta][:country_count]).to eq(1)
          expect(json[:meta][:total_podcast_listens]).to eq(1)
        end
      end
    end

    context 'CSV format' do
      it 'returns CSV response' do
        get :show, params: { case_slug: kase.slug }, format: :csv

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('text/csv')
      end

      it 'sets Content-Disposition for download' do
        get :show, params: { case_slug: kase.slug }, format: :csv

        expect(response.headers['Content-Disposition']).to include('attachment')
      end
    end

    context 'authentication' do
      before { sign_out reader }

      it 'redirects unauthenticated users' do
        get :show, params: { case_slug: kase.slug }

        expect(response).to redirect_to(new_reader_session_path)
      end
    end

    context 'authorization' do
      let(:unauthorized_reader) { create(:reader) }

      before do
        sign_out reader
        sign_in unauthorized_reader
      end

      it 'denies access to unauthorized users' do
        get :show, params: { case_slug: kase.slug }

        expect(response).to have_http_status(:forbidden).or have_http_status(:redirect)
      end
    end
  end

  describe 'caching integration' do
    before do
      create(:ahoy_event, visit: visit, user: reader, case_id: kase.id,
                          name: 'visit_case', time: Time.current)
    end

    it 'uses Rails.cache.fetch for stats data' do
      expect(Rails.cache).to receive(:fetch)
        .with(anything, hash_including(:expires_in))
        .at_least(:once)
        .and_call_original

      get :show, params: { case_slug: kase.slug }, format: :json
    end

    it 'uses different cache keys for different date ranges' do
      # Ensure case was created before these dates
      kase.update!(created_at: Date.new(2023, 1, 1))

      service1 = CaseStatsService.new(kase, from: '2024-01-01', to: '2024-06-30')
      service2 = CaseStatsService.new(kase, from: '2024-01-01', to: '2024-12-31')

      expect(service1.cache_key).not_to eq(service2.cache_key)
    end
  end
end
