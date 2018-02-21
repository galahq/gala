# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CasesController do
  describe 'POST #create' do
    it 'creates a new case with an editorship for the current user' do
      reader = create :reader
      sign_in reader

      post :create, params: { case: { kicker: 'Solar Flares',
                                      title: 'How can we see more aurora?' } }

      kase = Case.friendly.find 'solar-flares'
      expect(kase.editors).to include reader
    end
  end
end
