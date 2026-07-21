# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Locks and taggings routes' do
  let(:reader) { create :reader }
  let(:kase) { create :case }

  before do
    allow_any_instance_of(ApplicationController)
      .to receive(:verified_request?).and_return(true)
    reader.my_cases << kase
    sign_in reader
  end

  describe 'GET /cases/:case_slug/locks.json' do
    it 'returns active locks for an editable case' do
      lock = create :lock, lockable: kase, reader: reader

      get "/cases/#{kase.slug}/locks.json"

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        including(param: lock.id.to_s)
      )
    end
  end

  describe 'POST /locks.json' do
    it 'creates a lock for a valid editable lockable' do
      expect do
        post '/locks.json',
             params: {
               lock: {
                 lockable_type: 'Case',
                 lockable_param: kase.slug
               }
             },
             as: :json
      end.to change(Lock, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.body).to be_json including(
        lockable: including(
          type: 'Case',
          param: kase.slug
        )
      )
    end

    it 'returns 422 for invalid lockable_type' do
      post '/locks.json',
           params: {
             lock: {
               lockable_type: 'DefinitelyNotAModel',
               lockable_param: kase.slug
             }
           },
           as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'DELETE /locks/:id.json' do
    it 'unlocks an existing lock' do
      lock = create :lock, lockable: kase, reader: reader

      expect do
        delete "/locks/#{lock.id}.json"
      end.to change(Lock, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  describe 'POST /cases/:case_slug/taggings.json' do
    it 'creates a tag for an editable case' do
      post "/cases/#{kase.slug}/taggings.json",
           params: { tagging: { tag_name: 'phase-five-route' } },
           as: :json

      expect(response).to have_http_status(:created)
      expect(response.body).to be_json including(
        name: 'phase-five-route'
      )
      expect(kase.reload).to be_tagged('phase-five-route')
    end
  end

  describe 'DELETE /cases/:case_slug/taggings/:tag_name.json' do
    it 'removes a tag from an editable case' do
      kase.tag('phase-five-route')

      delete "/cases/#{kase.slug}/taggings/phase-five-route.json"

      expect(response).to have_http_status(:no_content)
      expect(kase.reload).not_to be_tagged('phase-five-route')
    end
  end
end
