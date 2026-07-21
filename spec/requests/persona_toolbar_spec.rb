# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Persona toolbar', type: :request do
  it 'renders the shared toolbar contract classes in the admin layout' do
    reader = create(:reader)
    sign_in reader

    get edit_profile_persona_path

    expect(response).to have_http_status(:ok)

    document = Nokogiri::HTML.parse(response.body)

    expect(document.css('nav.Toolbar__bar').count).to eq(1)
    expect(document.css('.Toolbar__group').count).to eq(3)
    expect(document.css('.Toolbar__item').count).to be >= 3
    expect(document.css('.Toolbar__search').count).to eq(1)
  end
end
