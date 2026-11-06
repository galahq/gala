# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Linked resource routes' do
  let(:reader) { create :reader }
  let(:kase) { create :case }
  let(:attributes) do
    {
      name: 'RAISE grant',
      connection: 'grant',
      identifiers: [{ type: 'doi', value: 'https://doi.org/10.1000/xyz123' }],
      position: 0
    }
  end

  before do
    allow_any_instance_of(ApplicationController)
      .to receive(:verified_request?).and_return(true)
    reader.my_cases << kase
    sign_in reader
  end

  describe 'POST /cases/:case_slug/linked_resources' do
    it 'creates a linked resource' do
      expect do
        post "/cases/#{kase.slug}/linked_resources",
             params: { linked_resource: attributes }, as: :json
      end.to change(LinkedResource, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.body).to be_json including(
        name: 'RAISE grant',
        connection: 'grant',
        identifiers: [{ type: 'doi', value: '10.1000/xyz123' }]
      )
    end

    it 'accepts camelCase keys from the client' do
      post "/cases/#{kase.slug}/linked_resources",
           params: { linkedResource: attributes.merge(
             connection: 'other', connectionOther: 'Dataset'
           ) },
           as: :json

      expect(response).to have_http_status(:created)
      expect(LinkedResource.last.connection_other).to eq 'Dataset'
    end

    it 'rejects an invalid linked resource' do
      expect do
        post "/cases/#{kase.slug}/linked_resources",
             params: { linked_resource: attributes.merge(identifiers: []) },
             as: :json
      end.not_to change(LinkedResource, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PUT /cases/:case_slug/linked_resources/:id' do
    it 'updates a linked resource' do
      resource = kase.linked_resources.create!(attributes)

      put "/cases/#{kase.slug}/linked_resources/#{resource.id}",
          params: { linked_resource: { position: 3, name: 'Renamed' } },
          as: :json

      expect(response).to have_http_status(:ok)
      expect(resource.reload).to have_attributes position: 3, name: 'Renamed'
    end
  end

  describe 'DELETE /cases/:case_slug/linked_resources/:id' do
    it 'destroys a linked resource' do
      resource = kase.linked_resources.create!(attributes)

      expect do
        delete "/cases/#{kase.slug}/linked_resources/#{resource.id}"
      end.to change(LinkedResource, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  it 'does not let other readers edit a case’s linked resources' do
    sign_in create(:reader)

    post "/cases/#{kase.slug}/linked_resources",
         params: { linked_resource: attributes }, as: :json

    expect(LinkedResource.count).to eq 0
  end
end
