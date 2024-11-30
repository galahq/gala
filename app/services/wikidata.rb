# frozen_string_literal: true

require 'sparql/client'
require 'json'

=begin
examples:
- researchers: Q937 (Albert Einstein)
- software: Q28865 (Python), Q61080677 (HDF5), Q161053 (Ruby)
- hardware: Q122851721 (Raspberry Pi 5), Q78982844 (MacBook Pro 16-inch)
- grants: Q123128273 (RAISE: Neighborhood Environments as Socio-Techno-bio Systems)
- works: Q58260882 (The written works of Philip and Iona Mayer )
=end

class Wikidata
  ENDPOINT = 'https://query.wikidata.org/sparql'

  SCHEMAS = {
    :researchers => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>

      SELECT ?entity ?entityLabel ?discipline ?disciplineLabel ?occupation ?occupationLabel ?orcid ?scopus WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q5 }
        OPTIONAL { ?entity wdt:P106 ?occupation . }
        OPTIONAL { ?entity wdt:P101 ?discipline . }
        OPTIONAL { ?entity wdt:P496 ?orcid . }
        OPTIONAL { ?entity wdt:P1153 ?scopus . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
    :software => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>

      SELECT ?entity ?entityLabel ?developerLabel ?programmingLanguageLabel ?copyrightLicenseLabel ?developer ?platform ?platformLabel ?programmingLanguage ?operatingSystem ?operatingSystemLabel ?sourceCodeRepository ?officialWebsite ?copyrightLicense ?inception ?softwareVersion ?follows ?followsLabel ?genre ?genreLabel ?userManual WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q341 wd:Q7397 wd:Q1639024 wd:Q21127166 wd:Q21129801 wd:Q24529812 wd:Q9143 }
        OPTIONAL { ?entity wdt:P178 ?developer . }
        OPTIONAL { ?entity wdt:P400 ?platform . }
        OPTIONAL { ?entity wdt:P277 ?programmingLanguage . }
        OPTIONAL { ?entity wdt:P306 ?operatingSystem . }
        OPTIONAL { ?entity wdt:P1324 ?sourceCodeRepository . }
        OPTIONAL { ?entity wdt:P856 ?officialWebsite . }
        OPTIONAL { ?entity wdt:P275 ?copyrightLicense . }
        OPTIONAL { ?entity wdt:P571 ?inception . }
        OPTIONAL { ?entity wdt:P348 ?softwareVersion . }
        OPTIONAL { ?entity wdt:P156 ?follows . }
        OPTIONAL { ?entity wdt:P136 ?genre . }
        OPTIONAL { ?entity wdt:P2078 ?userManual . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
    :hardware => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>

      SELECT ?entity ?entityLabel ?manufacturer ?manufacturerLabel ?model ?modelLabel WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q3966 wd:Q55990535 }
        OPTIONAL { ?entity wdt:P176 ?manufacturer . }
        OPTIONAL { ?entity wdt:P1072 ?model . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
    :grants => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>

      SELECT ?entity ?entityLabel ?funder ?funderLabel ?recipient ?recipientLabel WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q230788 }
        OPTIONAL { ?entity wdt:P8324 ?funder . }
        OPTIONAL { ?entity wdt:P8323 ?recipient . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
    :works => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>

      SELECT ?entity ?entityLabel ?author ?authorLabel ?title ?titleLabel ?publicationDate WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q47461344 }
        OPTIONAL { ?entity wdt:P50 ?author . }
        OPTIONAL { ?entity wdt:P1476 ?title . }
        OPTIONAL { ?entity wdt:P577 ?publicationDate . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
  }

  PROPERTY_ORDER = {
    researchers: %w[entity entityLabel disciplineLabel occupationLabel orcid scopus],
    software: %w[entity entityLabel developerLabel programmingLanguageLabel copyrightLicenseLabel],
    hardware: %w[entity entityLabel manufacturerLabel modelLabel],
    grants: %w[entity entityLabel funderLabel recipientLabel],
    works: %w[entity entityLabel authorLabel titleLabel publicationDate]
  }

  attr_reader :sparql_query, :data

  def initialize(schema, qid, locale = 'en')
    @client = SPARQL::Client.new(ENDPOINT)
    @schema = schema.downcase.to_sym
    @qid = qid
    @locale = locale
  end

  def call
    @sparql_query = SCHEMAS[@schema] % { qid: @qid, locale: @locale }
    result = @client.query(sparql_query)
    return nil if result.empty?
    property_order = PROPERTY_ORDER[@schema]

    @data = {}.tap do |json|
      json['entity'] = ''
      json['entityLabel'] = ''
      json['schema'] = @schema
      json['properties'] = []

      result.each do |solution|
        property_order.each do |property|
          value = solution[property.to_sym].to_s
          next if value.nil?

          case property
          when 'entity'
            json['entity'] = value
          when 'entityLabel'
            json['entityLabel'] = value
          else
            json['properties'] << {
              camel_case_to_title_case(property.split('Label')[0]) => value
            }
          end
        end
      end
    end

    @data['json_ld'] = generate_json_ld
    @data
  rescue StandardError => e
    Rails.logger.error "Error in Wikidata call method: #{e.message}"
    raise
  end

  def sparql_query
    @sparql_query ||= SCHEMAS[@schema] % { qid: @qid, locale: @locale }
  end

  private

  def generate_json_ld(data = @data)
    {
      "@context": "https://schema.org",
      "@type": "Thing",
      "name": data['entityLabel'],
      "identifier": data['entity'],
      "additionalProperty": data['properties'].map do |property|
        key, value = property.first
        {
          "@type": "PropertyValue",
          "name": key,
          "value": value
        }
      end
    }
  end

  def camel_case_to_title_case(camel_case)
    camel_case.gsub(/([A-Z])/, ' \1').split.map(&:capitalize).join(' ')
  end

end
