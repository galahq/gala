# frozen_string_literal: true

require 'rails_helper'

# Personal data used to reach two places no deletion workflow can touch:
# the application logs (filter_parameters was [:password] only, while lograge
# logs every other parameter) and Sentry (the user's email attached to every
# event, plus the raw parameter hash). Both are closed. These specs make a
# regression loud, because nothing else would — emails would just quietly
# start flowing again.
RSpec.describe 'PII in logs and error monitoring' do
  describe 'parameter filtering' do
    let(:filter) { ActiveSupport::ParameterFilter.new(Rails.application.config.filter_parameters) }

    it 'redacts email addresses, tokens and passwords from logged params' do
      filtered = filter.filter(
        'email' => 'someone@example.com',
        'unconfirmed_email' => 'new@example.com',
        'password' => 'hunter2',
        'password_confirmation' => 'hunter2',
        'confirmation_token' => 'abc123',
        'authentication_token' => 'xyz789'
      )

      expect(filtered.values).to all(eq('[FILTERED]'))
    end

    it 'leaves ordinary parameters alone' do
      filtered = filter.filter('name' => 'Reader Name', 'locale' => 'en')

      expect(filtered).to eq('name' => 'Reader Name', 'locale' => 'en')
    end
  end

  describe 'Sentry scope' do
    let(:reader) { create(:reader) }
    let(:scope) { instance_double(Sentry::Scope, set_user: nil, set_extras: nil) }

    before do
      allow(Sentry).to receive(:configure_scope).and_yield(scope)
    end

    it 'identifies a signed-in reader by id, never by email' do
      sign_in reader
      get root_path

      expect(scope).to have_received(:set_user).with(id: reader.id)
      expect(scope).not_to have_received(:set_user).with(hash_including(:email))
    end

    it 'does not attach request parameters' do
      sign_in reader
      get root_path, params: { probe: 'value' }

      expect(scope).to have_received(:set_extras).with(url: a_string_including('probe=value'))
      expect(scope).not_to have_received(:set_extras).with(hash_including(:params))
    end

    it 'sets no user when nobody is signed in' do
      get root_path

      expect(scope).not_to have_received(:set_user)
    end
  end
end
