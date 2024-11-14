# frozen_string_literal: true

require 'sparql/client'
require 'json'

class Wikidata
  ENDPOINT = 'https://query.wikidata.org/sparql'

  def initialize
    @client = SPARQL::Client.new(ENDPOINT)
  end

  def call(qid)
    Rails.logger.info "Wikidata call method invoked with QID: #{qid}"
    sparql_query = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>

      SELECT ?researcher ?researcherLabel ?discipline ?disciplineLabel ?orcid ?scopus WHERE {
        BIND(wd:#{qid} AS ?researcher)
        ?researcher wdt:P31 wd:Q5 ;          # Instance of = human
                    wdt:P106 wd:Q1650915 .   # Occupation = researcher
        OPTIONAL { ?researcher wdt:P101 ?discipline . }
        OPTIONAL { ?researcher wdt:P496 ?orcid . }
        OPTIONAL { ?researcher wdt:P1153 ?scopus . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 1
    SPARQL

    results = @client.query(sparql_query)
    Rails.logger.info "Wikidata query results: #{results.inspect}"

    json_results = results.map do |solution|
      {
        researcher: solution[:researcher].to_s,
        researcherLabel: solution[:researcherLabel].to_s,
        discipline: solution[:discipline].to_s,
        disciplineLabel: solution[:disciplineLabel].to_s,
        orcid: solution[:orcid].to_s,
        scopus: solution[:scopus].to_s
      }
    end

    json_results.to_json
  rescue StandardError => e
    Rails.logger.error "Error in Wikidata call method: #{e.message}"
    raise
  end
end
