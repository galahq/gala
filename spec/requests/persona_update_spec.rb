# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Persona update' do
  it 'automatically invites readers to caselog if they select teacher persona' do
    reader = create :reader

    sign_in reader
    patch profile_persona_path, params: { persona: 'teacher' }

    expect(reader.communities.include?(Community.case_log))
  end

  it 'automatically invites readers to caselog if they select writer persona' do
    reader = create :reader

    sign_in reader
    patch profile_persona_path, params: { persona: 'writer' }

    expect(reader.communities.include?(Community.case_log))
  end
end
