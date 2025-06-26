# frozen_string_literal: true

require 'sparql/client'
require 'json'
require 'date'
require 'active_support/core_ext/string/inflections'
require 'set'

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
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?discipline ?disciplineLabel ?occupation ?occupationLabel ?ORCID ?SCOPUS ?dateModified WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q5 }
        OPTIONAL { ?entity wdt:P106 ?occupation . }
        OPTIONAL { ?entity wdt:P101 ?discipline . }
        OPTIONAL { ?entity wdt:P496 ?ORCID. }
        OPTIONAL { ?entity wdt:P1153 ?SCOPUS . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
    :software => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?developerLabel ?programmingLanguageLabel ?copyrightLicenseLabel ?developer ?platform ?platformLabel ?programmingLanguage ?operatingSystem ?operatingSystemLabel ?sourceCodeRepository ?officialWebsite ?copyrightLicense ?inception ?softwareVersion ?follows ?followsLabel ?genre ?genreLabel ?userManual ?dateModified WHERE {
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
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
    :hardware => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?manufacturer ?manufacturerLabel ?model ?modelLabel ?dateModified WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q3966 wd:Q55990535 }
        OPTIONAL { ?entity wdt:P176 ?manufacturer . }
        OPTIONAL { ?entity wdt:P1072 ?model . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
    :grants => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?funder ?funderLabel ?recipient ?recipientLabel ?dateModified WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q230788 }
        OPTIONAL { ?entity wdt:P8324 ?funder . }
        OPTIONAL { ?entity wdt:P8323 ?recipient . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
    :works => <<-SPARQL,
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?author ?authorLabel ?title ?titleLabel ?publicationDate ?DOI ?dateModified WHERE {
        BIND(wd:%{qid} AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q47461344 }
        OPTIONAL { ?entity wdt:P50 ?author . }
        OPTIONAL { ?entity wdt:P1476 ?title . }
        OPTIONAL { ?entity wdt:P577 ?publicationDate . }
        OPTIONAL { ?entity wdt:P356 ?doi . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%{locale},en". }
      }
      LIMIT 1
    SPARQL
  }

  PROPERTY_ORDER = {
    researchers: %w[entity entityLabel disciplineLabel occupationLabel ORCID SCOPUS dateModified],
    software: %w[entity entityLabel developerLabel programmingLanguageLabel copyrightLicenseLabel dateModified],
    hardware: %w[entity entityLabel manufacturerLabel modelLabel dateModified],
    grants: %w[entity entityLabel funderLabel recipientLabel dateModified],
    works: %w[entity entityLabel authorLabel titleLabel publicationDate DOI dateModified]
  }

  attr_reader :locale

  def initialize(locale = 'en')
    @client = SPARQL::Client.new(ENDPOINT)
    @locale = locale
  end

  def canned_query(schema, qid)
    sparql_query = SCHEMAS[schema.to_sym] % { qid: qid, locale: @locale }
    result = @client.query(sparql_query)
    Rails.logger.info "Wikidata query: #{sparql_query}"
    return nil if result.empty?
    property_order = PROPERTY_ORDER[schema.to_sym]

    data = {}.tap do |json|
      json['entity'] = ''
      json['entityLabel'] = ''
      json['schema'] = schema
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
          when 'dateModified'
            json['dateModified'] = humanize_date(value)
          else
            json['properties'] << {
              humanize_sparql_subject(property.split('Label')[0]) => value
            }
          end
        end
      end
    end

    data['json_ld'] = generate_json_ld data
    data
  rescue StandardError => e
    Rails.logger.error "Error in Wikidata call method: #{e.message}"
    raise
  end

  # Search Wikidata for entities matching the given label
  # @param partial_label [String] The search term to look for
  # @param schema [String, nil] Optional schema type to filter results. 
  #   Valid values: 'researchers', 'software', 'hardware', 'grants', 'works'
  #   When provided, only returns entities that match the schema's instance types
  # @return [Array<Hash>] Array of search results with qid, label, description, instance, and image
  def search(partial_label, schema = nil)
    partial_label = partial_label.downcase

    # Define instance types for each schema
    schema_instances = {
      researchers: ['wd:Q5'],
      software: ['wd:Q341', 'wd:Q7397', 'wd:Q1639024', 'wd:Q21127166', 'wd:Q21129801', 'wd:Q24529812', 'wd:Q9143'],
      hardware: ['wd:Q3966', 'wd:Q55990535'],
      grants: ['wd:Q230788'],
      works: ['wd:Q47461344']
    }

    # Build the instance filter if schema is provided
    instance_filter = ''
    if schema && schema_instances[schema.to_sym]
      instances = schema_instances[schema.to_sym]
      instance_values = instances.map { |i| i }.join(' ')
      instance_filter = <<-SPARQL
        ?item wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { #{instance_values} }
      SPARQL
    end

    sparql_query = <<-SPARQL
      PREFIX wikibase: <http://wikiba.se/ontology#>
      PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
      PREFIX schema: <http://schema.org/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT DISTINCT ?item ?itemLabel ?description ?image ?instanceLabel WHERE {
        SERVICE wikibase:mwapi {
          bd:serviceParam wikibase:endpoint "www.wikidata.org";
                         wikibase:api "EntitySearch";
                         mwapi:search "%{query}";
                         mwapi:language "en";
                         mwapi:limit "20".
          ?item wikibase:apiOutputItem mwapi:item.
        }

        ?item rdfs:label ?itemLabel.
        FILTER(LANG(?itemLabel) = "en")

        #{instance_filter}

        OPTIONAL { ?item schema:description ?description. FILTER(LANG(?description) = "en") }
        OPTIONAL { ?item wdt:P31 ?instance. ?instance rdfs:label ?instanceLabel. FILTER(LANG(?instanceLabel) = "en") }
        OPTIONAL { ?item wdt:P18 ?image }
      }
    SPARQL

    sparql_query = sparql_query % { query: partial_label }
    Rails.logger.info "Wikidata query with mwapi: #{sparql_query}"

    results = @client.query(sparql_query)
    
    # Deduplicate results by QID, keeping the first occurrence of each
    seen_qids = Set.new
    results.map do |result|
      qid = result[:item].to_s.split('/').last
      next if seen_qids.include?(qid)
      seen_qids.add(qid)
      
      {
        qid: qid,
        label: result[:itemLabel].to_s,
        description: result[:description]&.to_s,
        instance: result[:instanceLabel]&.to_s,
        image: result[:image]&.to_s
      }
    end.compact
  rescue StandardError => e
    Rails.logger.error "Error in Wikidata search method: #{e.message}"
    raise
  end

  private

  def generate_json_ld(data)
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

  def humanize_date(date_string)
    DateTime.parse(date_string).strftime('%B %d, %Y')
  end

  def humanize_sparql_subject(subject)
    if subject == subject.upcase
      subject
    else
      subject.gsub(/([a-z])([A-Z])/, '\1 \2').humanize
    end
  end

=begin
Reference from Gerd: https://www.wikidata.org/wiki/EntitySchema:E469


PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

# Example SPARQL query: SELECT ?p { VALUES ?p { wd:Q130407462 }}
# Example SPARQL query: SELECT ?gcs WHERE { ?gcs wdt:P1433 wd:Q130549584 . }

START = @<GalaCaseStudy>

<GalaCaseStudy> EXTRA wdt:P31 {
    wdt:P31 [ wd:Q155207 ] ;      # Instance of: case study
    wdt:P1476 rdf:langString? ;   # title
    wdt:P921 IRI+ ;               # main subject
    wdt:P2093 xsd:string* ;       # author name string
    wdt:P50 IRI* ;                # author
    wdt:P407 IRI ;                # Language of work or name
    wdt:P953 IRI+ ;               # full work available at URL
    wdt:P1433 [ wd:Q130549584 ] ; # Published in: Gala
    wdt:P571 xsd:dateTime? ;      # Inception
    wdt:P577 xsd:dateTime? ;      # Publication date
    wdt:P5017 xsd:dateTime? ;     # Last update
    wdt:P276 @<Location>*  ;      # Location
    wdt:P6216 [ wd:Q50423863 ] ;  # Copyright status: copyrighted
    wdt:P275 @<License> ;
    # part of P:361 -> Gala library: we need an entity for this
}

<Location> EXTRA wdt:P31 {
  wdt:P31 [ wd:Q2221906 ] ?
}

<License> EXTRA wdt:P31 {
  wdt:P31 [ wd:Q79719 ] ?
}


=end



  class SyncService



    def initialize
      @client = SPARQL::Client.new(ENDPOINT)
    end
  end


end
