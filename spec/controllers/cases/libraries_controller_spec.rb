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

    it 'allows a manager to remove her case from her library' do
      reader.my_cases << kase
      reader.libraries << library

      patch :update, params: { case_slug: kase.slug,
                               case: { library_id: nil } }
      expect(flash[:notice]).to match 'successfully updated'

      kase.reload
      expect(kase.library_id).to eq nil
    end

    it 'rejects a user who’s trying to add her case to a library ' \
       'she does not manage' do
      patch :update, params: { case_slug: kase.slug,
                               case: { library_id: library.id } }

      expect(response).to redirect_to '/403'

      kase.reload
      expect(kase.library_id).not_to eq library.id
    end
  end
end
