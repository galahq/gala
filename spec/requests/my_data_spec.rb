# frozen_string_literal: true

require 'rails_helper'

# The Your data page and its download (register 9b), and the same download
# for a site admin.
RSpec.describe 'Your data' do
  let(:reader) { create :reader, name: 'Jordan Real' }

  it 'needs a signed-in reader' do
    get download_my_data_path

    expect(response).to redirect_to new_reader_session_path
  end

  context 'when signed in' do
    before { sign_in reader }

    it 'is linked from account settings' do
      get edit_profile_path

      expect(response.body).to include my_data_path
    end

    it 'says what Gala holds, why, and links the download' do
      create_list :comment, 3, reader: reader

      get my_data_path

      expect(response).to have_http_status :ok
      expect(response.body).to include '3 comments'
      expect(response.body).to include I18n.t('my_data.about.purposes.discussions.why').strip
      expect(response.body).to include I18n.t('my_data.about.rights_heading')
      expect(response.body).not_to include I18n.t('my_data.about.purposes.activity.what')
      expect(response.body).to include download_my_data_path
    end

    it 'says what reading activity holds, when there is some' do
      create :visit, user: reader

      get my_data_path

      expect(response.body).to include '1 visit, with your device and an approximate location'
    end

    it 'downloads the reader’s own data as a JSON file nobody caches' do
      create :comment, reader: reader, content: 'Mine'

      get download_my_data_path

      expect(response).to have_http_status :ok
      expect(response.media_type).to eq 'application/json'
      expect(response.headers['Content-Disposition']).to start_with 'attachment'
      expect(response.headers['Content-Disposition']).to include "gala-data-#{reader.id}-"
      expect(response.headers['Cache-Control']).to include 'no-store'
      # Streamed: Rack::ETag would otherwise build the whole file to hash it.
      expect(response.headers['ETag']).to be_nil
      data = JSON.parse(response.body)
      expect(data['account']['name']).to eq 'Jordan Real'
      expect(data['comments'].sole['text']).to eq('en' => 'Mine')
    end

    it 'downloads even when the reader hasn’t accepted new terms' do
      reader.update_columns(terms_of_service: 0)

      get download_my_data_path

      expect(response).to have_http_status :ok
      expect(JSON.parse(response.body)['account']['id']).to eq reader.id
    end
  end

  describe 'from the admin reader page' do
    let(:admin) { create :reader, :editor }

    it 'downloads any reader’s data for a site admin, closed accounts included' do
      Readers::CloseAccount.call(reader)
      sign_in admin

      get admin_reader_path(reader)
      expect(response.body).to include export_admin_reader_path(reader)

      get export_admin_reader_path(reader)

      expect(response).to have_http_status :ok
      expect(response.headers['Content-Disposition']).to include "gala-data-#{reader.id}-"
      expect(JSON.parse(response.body)['account']['id']).to eq reader.id
    end

    it 'is not for anyone else' do
      sign_in create(:reader)

      get export_admin_reader_path(reader)

      expect(response).to redirect_to '/403'
    end
  end
end
