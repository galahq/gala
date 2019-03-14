# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Persona update' do
  it 'sets the persona' do
    reader = create :reader
    sign_in reader

    patch profile_persona_path, params: { persona: 'teacher' }

    reader.reload
    expect(reader.persona).to eq 'teacher'
  end
end
