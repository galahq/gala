# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReadersController, type: :controller do
  describe 'PUT #update' do
    context 'on a user with a password' do
      it 'does not accept :password' do
        reader = create :reader
        sign_in reader

        pass = 'new_password'
        put :update, params: { id: reader, reader: { password: pass } }
        reader.reload
        expect(reader.valid_password?(pass)).to be false
      end
    end

    context 'on an oauth user with no password' do
      it 'accepts :password' do
        reader = create :reader, created_password: false
        sign_in reader

        pass = 'new_password'
        put :update, params: { id: reader, reader: { password: pass } }
        reader.reload
        expect(reader.created_password).to be true
        expect(reader.valid_password?(pass)).to be true
      end
    end

    context 'edit tos' do
      it 'visits :terms_of_service form' do
        reader = create :reader, terms_of_service: nil
        sign_in reader
        get :edit, params: { use_route: 'readers/edit_tos', id: reader.id }
        expect(response).to have_http_status(:success)
      end

      it 'accepts :terms_of_service' do
        reader = create :reader, terms_of_service: nil
        sign_in reader
        terms_of_service = '1'
        put :update_tos, params: { id: reader, reader: { terms_of_service: terms_of_service } }
        reader.reload
        expect(reader.terms_of_service).to eq 1
      end

    end
  end
end
