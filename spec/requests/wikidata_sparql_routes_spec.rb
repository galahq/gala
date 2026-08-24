# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Wikidata and SPARQL routes' do
  let(:reader) { create :reader }
  let(:kase) { create :case }
  let(:wikidata_result) do
    {
      'entity' => 'http://www.wikidata.org/entity/Q28865',
      'entityLabel' => 'Python',
      'schema' => 'software',
      'properties' => [],
      'json_ld' => {}
    }
  end

  before do
    allow_any_instance_of(ApplicationController)
      .to receive(:verified_request?).and_return(true)
  end

  describe 'GET /sparql' do
    it 'returns stubbed search results without live Wikidata access' do
      wikidata = instance_double(Wikidata)
      allow(Wikidata).to receive(:new).and_return(wikidata)
      allow(wikidata).to receive(:search)
        .with('python', 'software')
        .and_return([{ qid: 'Q28865', label: 'Python' }])

      get '/sparql', params: { query: 'python', schema: 'software' }

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        including(qid: 'Q28865', label: 'Python')
      )
    end

    it 'returns 404 for blank searches instead of raising' do
      get '/sparql', params: { query: '', schema: 'software' }

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET /sparql/:schema/:qid' do
    it 'returns canned query data without live Wikidata access' do
      wikidata = instance_double(Wikidata)
      allow(Wikidata).to receive(:new).and_return(wikidata)
      allow(wikidata).to receive(:canned_query)
        .with('software', 'Q28865')
        .and_return(wikidata_result)

      get '/sparql/software/Q28865'

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        entityLabel: 'Python',
        schema: 'software'
      )
    end

    it 'returns 404 for unsupported schemas instead of raising' do
      get '/sparql/unsupported/Q28865'

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /cases/:case_slug/wikidata_links' do
    before do
      reader.my_cases << kase
      sign_in reader
      allow_any_instance_of(Wikidata)
        .to receive(:canned_query).and_return(wikidata_result)
    end

    it 'creates a case Wikidata link with stubbed remote data' do
      expect do
        post "/cases/#{kase.slug}/wikidata_links",
             params: {
               wikidata_link: {
                 qid: 'Q28865',
                 schema: 'software',
                 position: 0
               }
             },
             as: :json
      end.to change(WikidataLink, :count).by(1)

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_json including(
        qid: 'Q28865',
        schema: 'software'
      )
    end
  end

  describe 'DELETE /cases/:case_slug/wikidata_links/:id' do
    before do
      reader.my_cases << kase
      sign_in reader
    end

    it 'destroys a case Wikidata link' do
      link = kase.wikidata_links.create!(
        qid: 'Q28865',
        schema: 'software',
        record_type: 'Case',
        record_id: kase.id
      )

      expect do
        delete "/cases/#{kase.slug}/wikidata_links/#{link.id}"
      end.to change(WikidataLink, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
