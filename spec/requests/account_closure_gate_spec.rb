# frozen_string_literal: true

require 'rails_helper'

# Grace-state rules W4 and W5: a closed reader can sign in by every route, so
# they can prove who they are, but until they restore the account every
# request lands on the restore page. Restoring takes an explicit click.
RSpec.describe 'Account closure sign-in gate' do
  let(:reader) { create :reader, name: 'Real Name', password: 'secret' }

  before { Readers::CloseAccount.call(reader) }

  describe 'signing in' do
    it 'sends a password sign-in to the restore page' do
      post reader_session_path,
           params: { reader: { email: reader.email, password: 'secret' } }

      expect(response).to redirect_to account_restoration_path
    end

    it 'signs an LTI launch in without enrolling it, and does not restore' do
      create :authentication_strategy, reader: reader, provider: 'lti',
                                       uid: 'lti-closed-reader'
      OmniAuth.config.mock_auth[:lti] =
        OmniAuth::AuthHash.new(provider: 'lti', uid: 'lti-closed-reader')
      expect(LinkerService).not_to receive(:new)

      post '/authentication_strategies/auth/lti/callback'

      expect(response).to redirect_to account_restoration_path
      expect(reader.reload).to be_closed
    ensure
      OmniAuth.config.mock_auth.delete(:lti)
    end
  end

  describe 'an existing session' do
    before { sign_in reader }

    it 'redirects every page to the restore page' do
      get root_path

      expect(response).to redirect_to account_restoration_path
    end

    it 'refuses JSON requests' do
      get profile_path(format: :json)

      expect(response).to have_http_status(:forbidden)
    end

    it 'keeps a closed reader off the profile form' do
      get edit_profile_path

      expect(response).to redirect_to account_restoration_path
    end

    it 'keeps a closed editor out of the admin screens' do
      reader.add_role :editor

      get '/admin/readers'

      expect(response).to redirect_to account_restoration_path
    end

    it 'does not bounce between the restore page and the terms page' do
      reader.update_column :terms_of_service, 0

      get account_restoration_path

      expect(response).to have_http_status(:ok)
    end

    it 'still lets the reader sign out' do
      delete destroy_reader_session_path

      get account_restoration_path
      expect(response).to redirect_to new_reader_session_path
    end
  end

  describe 'the restore page' do
    before { sign_in reader }

    it 'drops Devise\'s sign-in messages, which contradict the page' do
      post reader_session_path,
           params: { reader: { email: reader.email, password: 'secret' } }
      follow_redirect!

      expect(response.body).not_to include I18n.t('devise.sessions.signed_in')
    end

    it 'leaves out the account menu, which would only lead back here' do
      get account_restoration_path

      expect(response.body).not_to include 'main-menu-app'
    end

    it 'shows the deletion date and does not restore by itself' do
      get account_restoration_path

      date = reader.reload.pending_account_deletion_request.scheduled_for.to_date
      expect(response.body).to include I18n.l(date, format: :long)
      expect(reader).to be_closed
    end

    it 'restores the account on an explicit click' do
      post account_restoration_path

      expect(response).to redirect_to root_path
      expect(reader.reload).not_to be_closed
      expect(reader.name).to eq 'Real Name'
    end

    it 'lets the restored reader use the site again' do
      post account_restoration_path

      get edit_profile_path
      expect(response).to have_http_status(:ok)
    end
  end

  it 'keeps the account menu for open readers' do
    sign_in create(:reader)

    get edit_profile_path

    expect(response.body).to include 'main-menu-app'
  end

  it 'sends an open reader away from the restore page' do
    open_reader = create :reader
    sign_in open_reader

    get account_restoration_path

    expect(response).to redirect_to root_path
  end

  # W6: undo is signing in, so a reader who forgot their password must still
  # be able to get the reset email.
  it 'still sends a closed reader the password reset email' do
    expect do
      post reader_password_path, params: { reader: { email: reader.email } }
    end.to change(ActionMailer::Base.deliveries, :count).by(1)
  end
end
