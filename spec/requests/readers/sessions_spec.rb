# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Readers::Sessions', type: :request do
  describe 'GET /readers/sign_in.json' do
    it 'returns unescaped sign-in form markup without duplicated heading capture' do
      get new_reader_session_path(format: :json)

      expect(response).to have_http_status(:ok)

      form = JSON.parse(response.body).fetch('form')

      expect(form).to include('<h2>Sign in</h2>')
      expect(form.scan('<h2>Sign in</h2>').size).to eq(1)
      expect(form).not_to include('&lt;h2&gt;Sign in&lt;/h2&gt;')
      expect(form).to include('id="reader_email"')
      expect(form).to include('id="reader_password"')
    end
  end
end
