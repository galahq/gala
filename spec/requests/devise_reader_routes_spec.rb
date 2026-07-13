# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Devise reader routes' do
  it 'renders the reader sign-in form' do
    get new_reader_session_path

    expect(response).to have_http_status(:success)
    expect(response.body).to include('Sign in')
  end

  it 'renders a public Devise helper form' do
    get new_reader_password_path

    expect(response).to have_http_status(:success)
  end

  it 'renders the registration form' do
    get new_reader_registration_path

    expect(response).to have_http_status(:success)
  end

  it 'redirects an unauthenticated profile edit request to sign in' do
    get edit_profile_path

    expect(response).to redirect_to(new_reader_session_path)
  end

  it 'renders profile edit for a signed-in reader with current terms' do
    reader = create(:reader)
    sign_in reader

    get edit_profile_path

    expect(response).to have_http_status(:success)
  end

  it 'renders profile edit even when terms acceptance is pending' do
    reader = create(:reader, terms_of_service: nil)
    sign_in reader

    get edit_profile_path

    expect(response).to have_http_status(:success)
  end

  it 'updates profile details for the current reader' do
    reader = create(:reader)
    sign_in reader

    patch profile_path, params: { reader: { name: 'Updated Reader' } }

    expect(response).to redirect_to(edit_profile_path)
    expect(reader.reload.name).to eq('Updated Reader')
  end

  it 'redirects magic link without a key to the home page' do
    get magic_link_path

    expect(response).to redirect_to(root_path)
  end

  it 'preserves current invalid magic-link create behavior' do
    post magic_link_path

    expect(response).to redirect_to(new_reader_registration_path)
  end
end
