# frozen_string_literal: true

require 'sparql/client'
require 'json'
require 'date'
require 'active_support/core_ext/string/inflections'

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

  def search(partial_label)
    partial_label = partial_label.downcase

    sparql_query = <<-SPARQL
      PREFIX wikibase: <http://wikiba.se/ontology#>
      PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
      PREFIX schema: <http://schema.org/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?item ?itemLabel ?description ?image ?instanceLabel WHERE {
        SERVICE wikibase:mwapi {
          bd:serviceParam wikibase:endpoint "www.wikidata.org";
                         wikibase:api "EntitySearch";
                         mwapi:search "%{query}";
                         mwapi:language "en";
                         mwapi:limit "10".
          ?item wikibase:apiOutputItem mwapi:item.
        }

        ?item rdfs:label ?itemLabel.
        FILTER(LANG(?itemLabel) = "en")

        OPTIONAL { ?item schema:description ?description. FILTER(LANG(?description) = "en") }
        OPTIONAL { ?item wdt:P31 ?instance. ?instance rdfs:label ?instanceLabel. FILTER(LANG(?instanceLabel) = "en") }
        OPTIONAL { ?item wdt:P18 ?image }
      }
    SPARQL

    sparql_query = sparql_query % { query: partial_label }
    Rails.logger.info "Wikidata query with mwapi: #{sparql_query}"

    results = @client.query(sparql_query)
    results.map do |result|
      {
        qid: result[:item].to_s.split('/').last,
        label: result[:itemLabel].to_s,
        description: result[:description]&.to_s,
        instance: result[:instanceLabel]&.to_s,
        image: result[:image]&.to_s
      }
    end
  rescue StandardError => e
    Rails.logger.error "Error in Wikidata search method: #{e.message}"
    raise
  end

  private

  def generate_json_ld(data)
    # Get the entity properties if they exist
    properties = data['properties'] || []
    property_hash = properties.each_with_object({}) do |prop, hash|
      # Convert array of hashes like [{"Property name" => "value"}] to {"Property name" => "value"}
      prop.each { |k, v| hash[k] = v } if prop.is_a?(Hash)
    end

    # Base JSON-LD structure with more specific type for case studies
    json_ld = {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "name": data['entityLabel'],
      "identifier": data['entity'],
      "dateModified": data['dateModified'],
      "isAccessibleForFree": true
    }

    # Map Wikidata properties to Schema.org properties
    # Add well-known mappings
    if kase && !property_hash.empty?
      # Authors - combine both name strings and QIDs
      authors = []

      # Authors with just names (no Wikidata entries)
      if property_hash['Author name string'].present?
        author_names = property_hash['Author name string'].is_a?(Array) ?
                       property_hash['Author name string'] :
                       [property_hash['Author name string']]

        author_names.each do |name|
          authors << {
            "@type": "Person",
            "name": name
          }
        end
      end

      # Add author property if we have authors
      json_ld[:author] = authors if authors.present?

      # Publication date
      if property_hash['Publication date'].present?
        json_ld[:datePublished] = property_hash['Publication date']
      end

      # Language
      if property_hash['Language of work or name'].present?
        json_ld[:inLanguage] = property_hash['Language of work or name']
      end

      # URL where the full work is available
      if property_hash['Full work available at URL'].present?
        json_ld[:url] = property_hash['Full work available at URL']
      end

      # License
      if property_hash['License'].present?
        json_ld[:license] = property_hash['License']
      end

      # Main subjects as keywords
      if property_hash['Main subject'].present?
        subjects = property_hash['Main subject'].is_a?(Array) ?
                  property_hash['Main subject'] :
                  [property_hash['Main subject']]
        json_ld[:keywords] = subjects.join(', ')
      end

      # Location
      if property_hash['Location'].present?
        location = property_hash['Location']
        json_ld[:contentLocation] = {
          "@type": "Place",
          "name": location.is_a?(Array) ? location.first : location
        }
      end
    end

    # Add remaining properties that don't have a direct Schema.org mapping
    # as additionalProperty
    additional_props = []

    property_hash.each do |key, value|
      # Skip properties we've already mapped
      next if ['Author name string', 'Publication date', 'Language of work or name',
              'Full work available at URL', 'License', 'Main subject', 'Location'].include?(key)

      additional_props << {
        "@type": "PropertyValue",
        "name": key,
        "value": value
      }
    end

    json_ld[:additionalProperty] = additional_props if additional_props.present?

    # Return the structured JSON-LD
    json_ld
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
    attr_reader :kase, :locale

    def initialize(kase, locale = 'en')
      @kase = kase
      @locale = locale
      @client = SPARQL::Client.new(ENDPOINT)
    end

    # Main method to sync a case to Wikidata
    def sync!
      # If case doesn't have a Wikidata QID yet, create a new entity
      if existing_wikidata_link
        update_existing_entity
      else
        create_new_entity
      end
    end

    private

    def existing_wikidata_link
      @existing_wikidata_link ||= kase.wikidata_links.find_by(schema: 'case_study')
    end

    # Maps Case attributes to Wikidata properties according to GalaCaseStudy schema
    def case_to_wikidata_properties
      {
        'P31' => 'Q155207',                    # Instance of: case study
        'P1476' => kase.title,                 # Title
        'P921' => extract_main_subjects,       # Main subject (from tags)
        'P2093' => extract_author_names,       # Author name strings
        'P50' => extract_author_qids,          # Authors with Wikidata entries
        'P407' => map_locale_to_language_qid,  # Language of work
        'P953' => case_url,                    # Full work available at URL
        'P1433' => 'Q130549584',               # Published in: Gala
        'P577' => format_datetime(kase.published_at), # Publication date
        'P5017' => format_datetime(kase.updated_at),  # Last update
        'P276' => extract_location_qids,       # Locations
        'P6216' => 'Q50423863',                # Copyright status: copyrighted
        'P275' => map_license_to_qid           # License
      }.compact
    end

    # Creates a new Wikidata entity for the case
    def create_new_entity
      # In a real implementation, this would use Wikidata's API to create a new entity
      # For now, we'll just simulate this process

      Rails.logger.info "Creating new Wikidata entity for case: #{kase.id}"

      # 1. Call Wikidata API to create entity
      # 2. Get the assigned QID
      # 3. Create a WikidataLink record

      # Simulated response
      qid = "Q#{Time.now.to_i}" # This would actually come from the Wikidata API

      kase.wikidata_links.create!(
        qid: qid,
        schema: 'case_study',
        position: (kase.wikidata_links.maximum(:position) || 0) + 1,
        cached_json: { 'entityLabel' => kase.title },
        last_synced_at: Time.current
      )

      Rails.logger.info "Created Wikidata entity with QID: #{qid}"
      return qid
    end

    # Updates an existing Wikidata entity with current case data
    def update_existing_entity
      qid = existing_wikidata_link.qid
      Rails.logger.info "Updating Wikidata entity #{qid} for case: #{kase.id}"

      # In a real implementation, this would use Wikidata's API to update the entity
      # For now, we'll just update our local record

      existing_wikidata_link.update!(
        cached_json: { 'entityLabel' => kase.title, 'properties' => case_to_wikidata_properties },
        last_synced_at: Time.current
      )

      Rails.logger.info "Updated Wikidata entity with QID: #{qid}"
      return qid
    end

    # Helper methods to extract data in the format needed for Wikidata

    def extract_author_names
      kase.authors.map { |author| author['name'] }
    end

    def extract_author_qids
      # This would require looking up authors in Wikidata or having their QIDs stored
      # For now, returning an empty array
      []
    end

    def extract_main_subjects
      # Extract tags and map them to Wikidata QIDs if possible
      # For now, returning an empty array
      []
    end

    def map_locale_to_language_qid
      # Map ISO language code to Wikidata QID
      # Comprehensive mapping of language codes to Wikidata QIDs
      {
        # Most common languages
        'en' => 'Q1860',   # English
        'es' => 'Q1321',   # Spanish
        'fr' => 'Q150',    # French
        'de' => 'Q188',    # German
        'it' => 'Q652',    # Italian
        'pt' => 'Q5146',   # Portuguese
        'ru' => 'Q7737',   # Russian
        'zh' => 'Q7850',   # Chinese
        'ja' => 'Q5287',   # Japanese
        'ar' => 'Q13955',  # Arabic

        # Additional languages
        'nl' => 'Q7411',   # Dutch
        'sv' => 'Q9027',   # Swedish
        'ko' => 'Q9176',   # Korean
        'hi' => 'Q1568',   # Hindi
        'bn' => 'Q9610',   # Bengali
        'tr' => 'Q256',    # Turkish
        'pl' => 'Q809',    # Polish
        'uk' => 'Q8798',   # Ukrainian
        'el' => 'Q9129',   # Greek
        'cs' => 'Q9056',   # Czech
        'da' => 'Q9035',   # Danish
        'fi' => 'Q1412',   # Finnish
        'he' => 'Q9288',   # Hebrew
        'hu' => 'Q9067',   # Hungarian
        'id' => 'Q9240',   # Indonesian
        'no' => 'Q9043',   # Norwegian
        'ro' => 'Q7913',   # Romanian
        'th' => 'Q9217',   # Thai
        'vi' => 'Q9199'    # Vietnamese
      }[kase.locale] || 'Q1860' # Default to English if no mapping found
    end

    def extract_location_qids
      # If latitude/longitude are present, could try to find matching Wikidata location entities
      # For now, returning an empty array
      []
    end

    def map_license_to_qid
      # Map license to Wikidata QID based on the license ID in the case
      # License QIDs from Wikidata:
      # - All Rights Reserved - Q27935507 (copyright)
      # - CC BY-NC 4.0 - Q24082749 (CC BY-NC 4.0)
      # - CC BY-NC-ND 4.0 - Q24082750 (CC BY-NC-ND 4.0)
      license_qid_map = {
        'all_rights_reserved' => 'Q27935507', # All Rights Reserved (copyright)
        'cc_by_nc' => 'Q24082749',           # CC BY-NC 4.0
        'cc_by_nc_nd' => 'Q24082750'         # CC BY-NC-ND 4.0
      }

      # Get the license ID from the case
      license_id = kase.license

      # Return the corresponding QID or a default copyright QID if not found
      license_qid_map[license_id] || 'Q27935507'
    end

    def case_url
      # Generate the URL where the case can be accessed
      # This would need to be adjusted based on your routes
      Rails.application.routes.url_helpers.case_url(kase, host: ENV['APPLICATION_HOST'])
    end

    def format_datetime(datetime)
      datetime&.iso8601
    end
  end


end
