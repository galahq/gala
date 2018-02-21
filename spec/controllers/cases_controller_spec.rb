# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CasesController do
  let(:reader) { create :reader }

  before do
    sign_in reader
  end

  describe 'POST #create' do
    it 'creates a new case with an editorship for the current user' do
      post :create, params: { case: attributes_for(:case) }

      expect(reader.my_cases.count).to eq 1
    end

    it 'enrolls a the user in the case after it is created' do
      post :create, params: { case: attributes_for(:case) }

      reader.enrollments.reload
      expect(reader.enrollments.count).to eq 1
    end
  end
end
