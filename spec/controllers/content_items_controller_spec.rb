# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catalog::ContentItemsController, type: :controller do
  describe 'POST #create' do
    around :each do |example|
      override_environment_variables(&example)
    end

    it 'redirects to root when given invalid LTI params' do
      post :create, params: {}
      expect(response).to redirect_to root_url
    end

    it 'succeeds when given valid LTI params' do
      post :create, params: valid_lti_params
      expect(response).to have_http_status :ok
    end

    it 'saves the return url to the session' do
      post :create, params: valid_lti_params
      expect(session[:content_item_selection_params]).to be_present
      expect(session[:content_item_selection_params][:return_url])
        .to eq 'https://canvas.umich.edu/return_url'
    end
  end

  private

  def override_environment_variables
    cached_lti_key = ENV['LTI_KEY']
    cached_lti_secret = ENV['LTI_SECRET']
    ENV['LTI_KEY'] = 'test'
    ENV['LTI_SECRET'] = 'secret'
    yield
    ENV['LTI_KEY'] = cached_lti_key
    ENV['LTI_SECRET'] = cached_lti_secret
  end

  def valid_lti_params
    consumer = IMS::LTI::ToolConsumer.new ENV['LTI_KEY'], ENV['LTI_SECRET']
    consumer.set_config tool_configuration
    consumer.resource_link_id = 'consumer_secret'
    consumer.content_item_return_url = 'https://canvas.umich.edu/return_url'
    consumer.generate_launch_data
  end

  def tool_configuration
    IMS::LTI::ToolConfig.new title: 'Gala',
                             launch_url: catalog_content_items_url
  end
end
