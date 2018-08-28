# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Cases::LibrariesController do
  let(:reader) { create :reader }
  let(:kase) { create :case }
  let(:library) { create :library }

  before do
    sign_in reader
  end

  describe 'PUT #update' do
    it 'allows a manager who’s trying to add her case to her library' do
      reader.my_cases << kase
      reader.libraries << library

      patch :update, params: { case_slug: kase.slug,
                               case: { library_id: library.id } }
      expect(flash[:notice]).to match 'successfully updated'

      kase.reload
      expect(kase.library_id).to eq library.id
    end

    it 'rejects a user who’s trying to add her case to a library ' \
       'she does not manage' do
      patch :update, params: { case_slug: kase.slug,
                               case: { library_id: library.id } }
      expect(response.status).to eq 302
      expect(flash[:alert]).to eq I18n.t 'pundit.not_authorized'

      kase.reload
      expect(kase.library_id).not_to eq library.id
    end
  end
end
