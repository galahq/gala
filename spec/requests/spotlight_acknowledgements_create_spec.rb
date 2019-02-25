# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Spotlight acknowledgments create' do
  it 'creates a spotlight acknowledgement for the current reader' do
    reader = create :reader

    sign_in reader
    post '/spotlight_acknowledgements.json', params: {
      spotlight_acknowledgement: {
        spotlight_key: 'test_dummy'
      }
    }

    expect(response).to have_http_status(:created)

    spotlight_acknowledgement = SpotlightAcknowledgement.find_by(
      reader: reader,
      spotlight_key: 'test_dummy'
    )
    expect(spotlight_acknowledgement).to be_present
  end
end
