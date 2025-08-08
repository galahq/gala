# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CasesController, type: :controller do
  let(:reader) { create :reader }

  before do
    sign_in reader
  end

  describe 'POST #create' do
    it 'creates a new case with an editorship for the current user' do
      post :create, params: { case: attributes_for(:case) }

      expect(reader.my_cases.count).to eq 1
    end

    it 'enrolls the user in the case after it is created' do
      post :create, params: { case: attributes_for(:case) }

      reader.enrollments.reload
      expect(reader.enrollments.count).to eq 1
    end
  end

  describe 'GET #show' do
    it 'returns 200 with a valid case overview' do
      case_instance = create(:case, slug: 'valid-case', published: true)
      get :show, params: { case_slug: case_instance.slug }
      expect(response).to have_http_status(:ok)
    end

    it 'returns 200 with a valid case page' do
      case_instance = create(:case, slug: 'valid-case', published: true)
      get :show, params: { case_slug: case_instance.slug,
                           react_router_location: '1' }
      expect(response).to have_http_status(:ok)
    end

    it 'returns a 200 response with a valid case with locale' do
      case_instance = create(:case, slug: 'valid-case', published: true)
      get :show, params: { locale: 'es', case_slug: case_instance.slug,
                           react_router_location: '1' }
      expect(response).to have_http_status(:ok)
      expect(I18n.locale).to eq :es
    end
  end
end
