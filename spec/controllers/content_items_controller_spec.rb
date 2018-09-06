# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catalog::ContentItemsController, type: :controller do
  include Orchard::Integration::TestHelpers::LtiLaunch

  describe 'POST #create' do
    around :each do |example|
      override_environment_variables(&example)
    end

    it 'does not set selection parameters when given invalid LTI params' do
      post :create, params: {}
      expect(session[:content_item_selection_params]).to be_nil
    end

    it 'saves the return url to the session when given valid LTI params' do
      post :create, params: valid_lti_params
      expect(session[:content_item_selection_params]).to be_present
      expect(session[:content_item_selection_params][:return_url])
        .to eq 'https://canvas.umich.edu/return_url'
    end
  end
end
