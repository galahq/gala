# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Cases::SettingsController do
  let(:reader) { create :reader }
  let(:kase) { create :case }
  let(:library) { create :library }

  before do
    sign_in reader
  end

  describe 'PUT #update' do
    it 'rejects a user who’s trying to add her case to a library ' \
       'she does not manage' do
      patch :update, params: { case_slug: kase.slug,
                               case: { library_id: library.id } }
      expect(flash[:alert]).to eq I18n.t 'pundit.not_authorized'
    end
  end
end
