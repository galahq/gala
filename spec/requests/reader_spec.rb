# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Reader' do

  context 'edit tos' do
    it 'visits :terms_of_service form' do
      reader = create :reader, terms_of_service: nil
      sign_in reader
      get edit_tos_reader_path(reader)
      expect(response).to have_http_status(:success)
    end

    it 'accepts :terms_of_service' do
      reader = create :reader, terms_of_service: nil
      sign_in reader
      terms_of_service = '1'
      post update_tos_reader_path(reader), params: { id: reader, reader: { terms_of_service: terms_of_service } }
      reader.reload
      expect(reader.terms_of_service).to eq Rails.application.config.current_terms_of_service
    end
  end

  it 'redirects to :terms_of_service when nil' do
    reader = create :reader, terms_of_service: nil
    sign_in reader
    get cases_url
    expect(response).to redirect_to(edit_tos_reader_path(reader))
  end

  it 'does not redirect when terms_of_servie is populated' do
    reader = create :reader, terms_of_service: 1
    sign_in reader
    get cases_url
    expect(response).to have_http_status(:success)
  end

  it 'prompts again when application current terms of service is updated' do
    reader = create :reader, terms_of_service: nil
    sign_in reader
    terms_of_service = '1'
    post update_tos_reader_path(reader), params: { id: reader, reader: { terms_of_service: terms_of_service } }
    reader.reload
    expect(reader.terms_of_service).to eq Rails.application.config.current_terms_of_service
    Rails.application.config.current_terms_of_service = 5
    get cases_url
    expect(response).to redirect_to(edit_tos_reader_path(reader))
  end
  
end
