# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Persona update' do
  it 'sets the persona' do
    reader = create :reader
    sign_in reader

    put profile_persona_path, params: { persona: 'teacher' }

    reader.reload
    expect(reader.persona).to eq 'teacher'
  end

  it 'redirects to My Cases if the user choses writer as their persona' do
    reader = create :reader
    sign_in reader

    put profile_persona_path, params: { persona: 'writer' }

    expect(response).to redirect_to my_cases_path
  end

  it 'clears spotlight acknowledgement state when persona changes' do
    reader = create(:reader, persona: :writer)
    create :spotlight_acknowledgement, reader: reader, spotlight_key: 'add_collaborators'
    sign_in reader

    put profile_persona_path, params: { persona: 'teacher' }

    expect(reader.reload.spotlight_acknowledgements).to be_empty
  end
end
