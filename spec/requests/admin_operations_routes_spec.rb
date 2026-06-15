# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin operations routes' do
  let(:editor) { create(:reader, :editor) }
  let(:reader) { create(:reader) }

  describe 'admin shell access' do
    it 'redirects an anonymous visitor away from the admin root' do
      get admin_root_path

      expect(response).to redirect_to('/403')
    end

    it 'redirects a non-editor reader away from the admin root' do
      sign_in reader

      get admin_root_path

      expect(response).to redirect_to('/403')
    end

    it 'renders the admin root for an editor' do
      sign_in editor
      create(:case, :published)

      get admin_root_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Case')
    end

    it 'renders representative admin resources for an editor' do
      sign_in editor
      create(:reader)
      create(:reading_list)
      create(:deployment)

      get admin_readers_path
      expect(response).to have_http_status(:success)

      get admin_deployments_path
      expect(response).to have_http_status(:success)

      get admin_reading_lists_path
      expect(response).to have_http_status(:success)
    end

    it 'renders representative admin show pages for an editor' do
      sign_in editor
      kase = create(:case, :published)
      reader_record = create(:reader)
      deployment = create(:deployment)
      reading_list = create(:reading_list, reader: reader_record)
      visit = create(:visit, user: editor)
      event = create(:ahoy_event, visit: visit, user: editor, name: 'show_admin_event')

      get admin_case_path(kase)
      expect(response).to have_http_status(:success)

      get admin_reader_path(reader_record)
      expect(response).to have_http_status(:success)

      get admin_deployment_path(deployment)
      expect(response).to have_http_status(:success)

      get admin_reading_list_path(reading_list)
      expect(response).to have_http_status(:success)

      get admin_ahoy_event_path(event)
      expect(response).to have_http_status(:success)
    end
  end

  describe 'admin ahoy events' do
    it 'renders newest-first ordering for an editor' do
      sign_in editor
      visit = create(:visit, user: editor)
      older_event = create(:ahoy_event,
                           visit: visit,
                           user: editor,
                           name: 'older_admin_event',
                           time: 2.days.ago)
      newer_event = create(:ahoy_event,
                           visit: visit,
                           user: editor,
                           name: 'newer_admin_event',
                           time: Time.current)

      get admin_ahoy_events_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include(older_event.name)
      expect(response.body).to include(newer_event.name)
      expect(response.body.index(newer_event.name))
        .to be < response.body.index(older_event.name)
    end
  end

  describe 'sidekiq access' do
    it 'redirects an anonymous visitor to sign in' do
      get '/sidekiq'

      expect(response).to have_http_status(:found)
      expect(response.location).to include('/readers/sign_in')
    end

    it 'returns not found for a non-editor reader' do
      sign_in reader

      get '/sidekiq'

      expect(response).to have_http_status(:not_found)
    end

    it 'renders the sidekiq landing page for an editor' do
      sign_in editor

      get '/sidekiq'

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Sidekiq')
    end
  end
end
