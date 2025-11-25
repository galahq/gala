# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Readers::PasswordsController, type: :controller do
  describe 'POST #create' do
    context 'when user has Google OAuth and no password' do
      let(:reader) do
        reader = create(:reader, email: 'dev@learnmsc.org', created_password: false)
        reader.update_column(:encrypted_password, nil)
        reader.reload
      end
      let!(:google_auth) { create(:authentication_strategy, provider: 'google', reader: reader) }

      it 'does not send password reset email' do
        expect do
          post :create, params: { reader: { email: reader.email } }
        end.not_to change { ActionMailer::Base.deliveries.count }
      end

      it 'renders the new template with an error' do
        post :create, params: { reader: { email: reader.email } }
        expect(response).to render_template(:new)
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'adds an error message about Google sign-in' do
        post :create, params: { reader: { email: reader.email } }
        expect(assigns(:resource).errors[:email]).to include(
          I18n.t('errors.messages.google_oauth_user')
        )
      end
    end

    context 'when user has Google OAuth but also has a password' do
      let(:reader) do
        create(:reader, email: 'dev@learnmsc.org', password: 'existing_password')
      end
      let!(:google_auth) { create(:authentication_strategy, provider: 'google', reader: reader) }

      it 'allows password reset' do
        expect do
          post :create, params: { reader: { email: reader.email } }
        end.to change { ActionMailer::Base.deliveries.count }.by(1)
      end
    end

    context 'when user does not have Google OAuth' do
      let(:reader) { create(:reader, email: 'dev@learnmsc.org') }

      it 'allows password reset' do
        expect do
          post :create, params: { reader: { email: reader.email } }
        end.to change { ActionMailer::Base.deliveries.count }.by(1)
      end
    end

    context 'when email does not exist' do
      it 'does not raise an error' do
        expect do
          post :create, params: { reader: { email: 'nonexistent@example.com' } }
        end.not_to raise_error
      end
    end
  end
end

