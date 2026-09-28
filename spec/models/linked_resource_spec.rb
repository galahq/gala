# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LinkedResource do
  let(:kase) { create :case }

  def build_resource(**attributes)
    kase.linked_resources.build(
      { name: 'RAISE grant', connection: 'grant',
        identifiers: [{ type: 'url', value: 'https://example.org/grant' }] }
        .merge(attributes)
    )
  end

  describe 'validations' do
    it 'is valid with a name, connection, and identifier' do
      expect(build_resource).to be_valid
    end

    it 'requires a name' do
      expect(build_resource(name: '')).not_to be_valid
    end

    it 'requires a known connection' do
      expect(build_resource(connection: 'friendship')).not_to be_valid
    end

    it 'requires a label when the connection is other' do
      expect(build_resource(connection: 'other')).not_to be_valid
      expect(build_resource(connection: 'other', connection_other: 'Dataset'))
        .to be_valid
    end

    it 'requires at least one identifier' do
      resource = build_resource(identifiers: [{ type: 'doi', value: ' ' }])
      expect(resource).not_to be_valid
      expect(resource.errors[:identifiers]).to be_present
    end

    it 'rejects malformed identifiers' do
      %w[url doi wikidata].each do |type|
        resource = build_resource(identifiers: [{ type: type, value: 'nope' }])
        expect(resource).not_to be_valid, "expected #{type} “nope” to be invalid"
      end
    end

    it 'rejects unknown identifier types' do
      resource = build_resource(identifiers: [{ type: 'isbn', value: '123' }])
      expect(resource).not_to be_valid
    end
  end

  describe 'identifier normalization' do
    it 'strips DOI prefixes and upcases QIDs' do
      resource = build_resource(identifiers: [
                                  { type: 'doi', value: ' https://doi.org/10.1000/xyz123 ' },
                                  { type: 'doi', value: 'doi:10.1000/abc' },
                                  { type: 'wikidata', value: 'https://www.wikidata.org/wiki/q937' }
                                ])
      resource.validate
      expect(resource.identifiers.pluck('value'))
        .to eq %w[10.1000/xyz123 10.1000/abc Q937]
    end
  end

  describe 'URL normalization' do
    def normalized_url(value)
      resource = build_resource(identifiers: [{ type: 'url', value: value }])
      resource.validate
      [resource.identifiers.first['value'], resource.valid?]
    end

    it 'assumes https:// when the scheme is missing' do
      expect(normalized_url('example.org/page')).to eq ['https://example.org/page', true]
      expect(normalized_url('www.example.org')).to eq ['https://www.example.org', true]
      expect(normalized_url('//example.org')).to eq ['https://example.org', true]
    end

    it 'keeps an existing http or https scheme' do
      expect(normalized_url('http://example.org')).to eq ['http://example.org', true]
      expect(normalized_url('HTTPS://example.org/a?b=c')).to eq ['HTTPS://example.org/a?b=c', true]
    end

    it 'rejects other schemes and hosts without a dot' do
      expect(normalized_url('ftp://example.org').last).to be false
      expect(normalized_url('javascript://alert(1)').last).to be false
      expect(normalized_url('nope').last).to be false
    end
  end

  describe '.href_for' do
    it 'resolves each identifier type to a URL' do
      expect(described_class.href_for('type' => 'doi', 'value' => '10.1000/x'))
        .to eq 'https://doi.org/10.1000/x'
      expect(described_class.href_for('type' => 'wikidata', 'value' => 'Q937'))
        .to eq 'https://www.wikidata.org/wiki/Q937'
      expect(described_class.href_for('type' => 'url', 'value' => 'https://a.b'))
        .to eq 'https://a.b'
    end
  end

  describe 'JSON-LD' do
    it 'relates each connection to the case with a schema.org property' do
      kase.linked_resources.create!(
        name: 'RAISE grant', connection: 'grant',
        identifiers: [{ type: 'wikidata', value: 'Q123128273' }]
      )
      kase.linked_resources.create!(
        name: 'Paper', connection: 'publication', description: 'Case source',
        identifiers: [{ type: 'doi', value: '10.1000/xyz123' }]
      )
      kase.linked_resources.create!(
        name: 'Workshop', connection: 'event',
        identifiers: [{ type: 'url', value: 'https://example.org/workshop' }]
      )
      kase.linked_resources.create!(
        name: 'Dataset', connection: 'other', connection_other: 'Data',
        identifiers: [{ type: 'url', value: 'https://example.org/data' }]
      )

      ld = kase.reload.linked_resources_json_ld(url: 'https://gala/cases/x')

      expect(ld[:'@type']).to eq 'LearningResource'
      expect(ld[:funding]).to contain_exactly include(
        '@type': 'Grant', name: 'RAISE grant',
        sameAs: ['https://www.wikidata.org/wiki/Q123128273']
      )
      expect(ld[:citation]).to contain_exactly include(
        '@type': 'CreativeWork', description: 'Publication: Case source',
        identifier: [{ '@type': 'PropertyValue', propertyID: 'doi',
                       value: '10.1000/xyz123' }]
      )
      expect(ld[:mentions]).to contain_exactly(
        include('@type': 'Event', name: 'Workshop'),
        include('@type': 'Thing', name: 'Dataset', description: 'Data')
      )
    end

    it 'is nil without linked resources' do
      expect(kase.linked_resources_json_ld(url: 'https://gala/cases/x')).to be_nil
    end
  end
end
