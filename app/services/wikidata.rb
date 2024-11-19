# frozen_string_literal: true

require 'sparql/client'
require 'json'

=begin
examples:
- researchers: Q937 (Albert Einstein)
- software: Q28865 (Python), Q61080677 (HDF5), Q161053 (Ruby)
- hardware: Q122851721 (Raspberry Pi 5)
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
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 1
    SPARQL
    :software => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>

      SELECT ?entity ?entityLabel ?developer ?developerLabel ?programmingLanguage ?programmingLanguageLabel ?softwareVersion WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q341 wd:Q7397 wd:Q1639024 wd:Q21127166 wd:Q21129801 wd:Q24529812 wd:Q9143 }
        OPTIONAL { ?entity wdt:P178 ?developer . }
        OPTIONAL { ?entity wdt:P277 ?programmingLanguage . }
        OPTIONAL { ?entity wdt:P348 ?softwareVersion . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
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
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
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
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
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
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 1
    SPARQL
  }

  def initialize(schema, qid)
    @client = SPARQL::Client.new(ENDPOINT)
    @schema = schema.downcase.to_sym
    @qid = qid
  end

  def call
    Rails.logger.info "Wikidata call method invoked with schema: #{@schema}, QID: #{@qid}"
    sparql_query = SCHEMAS[@schema] % { qid: @qid }
    Rails.logger.info "Wikidata query: \n#{sparql_query}"
    results = @client.query(sparql_query)
    Rails.logger.info "Wikidata query results: #{results.inspect}"

    build_info_box(results)
  rescue StandardError => e
    Rails.logger.error "Error in Wikidata call method: #{e.message}"
    raise
  end

  private

  def build_info_box(results)
    info_box = { 'entity' => '', 'entityLabel' => '', 'properties' => [] }
    results.each do |solution|
      solution.each_binding do |key, value|
        if key.to_s == 'entity'
          info_box['entity'] = value.to_s
        elsif key.to_s == 'entityLabel'
          info_box['entityLabel'] = value.to_s
        else
          info_box['properties'] << { key.to_s => value.to_s }
        end
      end
    end
    info_box.to_json
  end
end
