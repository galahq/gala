module Wikidata
  module QueryBuilder
    PROPERTY_ORDER = {
      researchers: %w[entity entityLabel disciplineLabel occupationLabel ORCID SCOPUS dateModified],
      software: %w[entity entityLabel developerLabel programmingLanguageLabel copyrightLicenseLabel dateModified],
      hardware: %w[entity entityLabel manufacturerLabel modelLabel dateModified],
      grants: %w[entity entityLabel funderLabel recipientLabel dateModified],
      works: %w[entity entityLabel authorLabel titleLabel publicationDate DOI dateModified],
      case_study: %w[entity entityLabel authorLabel titleLabel publicationDate license dateModified]
    }

    def self.build_query(schema, qid, locale = 'en')
      schema = schema.to_sym if schema.is_a?(String)

      template = case schema
                 when :researchers then RESEARCHERS_TEMPLATE
                 when :software then SOFTWARE_TEMPLATE
                 when :hardware then HARDWARE_TEMPLATE
                 when :grants then GRANTS_TEMPLATE
                 when :works then WORKS_TEMPLATE
                 when :case_study then CASE_STUDY_TEMPLATE
                 else raise ArgumentError, "Unknown schema: #{schema}"
                 end

      format(template, qid: qid, locale: locale)
    end

    def self.build_search_query(query)
      format(SEARCH_TEMPLATE, query: query)
    end

    def self.build_case_to_wikidata_properties(kase, locale = 'en')
      {
        'P31' => 'Q155207', # Instance of: case study
        'P1476' => { value: kase.title, type: :string }, # Title
        'P2093' => kase.authors.map { |author| { value: author['name'], type: :string } }, # Author name strings
        'P407' => Utils.map_locale_to_language_qid(locale), # Language of work
        'P953' => { value: case_url(kase), type: :string }, # Full work available at URL
        'P1433' => 'Q130549584', # Published in: Gala
        'P577' => { value: Utils.format_datetime(kase.published_at), type: :time }, # Publication date
        'P5017' => { value: Utils.format_datetime(kase.updated_at), type: :time },  # Last update
        'P6216' => 'Q50423863', # Copyright status: copyrighted
        'P275' => Utils.map_license_to_qid(kase.license) # License
      }.compact
    end

    def self.case_url(kase)
      host = ENV['BASE_URL'].presence

      if Rails.env.test? || Rails.env.development?
        "https://#{host}/cases/#{kase.slug}"
      else
        begin
          Rails.application.routes.url_helpers.case_url(kase, host: host)
        rescue ArgumentError => e
          Rails.logger.warn "Error generating case URL: #{e.message}. Using fallback URL."
          "https://#{host}/cases/#{kase.slug}"
        end
      end
    end

    RESEARCHERS_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?discipline ?disciplineLabel ?occupation ?occupationLabel ?ORCID ?SCOPUS ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q5 }
        OPTIONAL { ?entity wdt:P106 ?occupation . }
        OPTIONAL { ?entity wdt:P101 ?discipline . }
        OPTIONAL { ?entity wdt:P496 ?ORCID. }
        OPTIONAL { ?entity wdt:P1153 ?SCOPUS . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%<locale>s,en". }
      }
      LIMIT 1
    SPARQL

    SOFTWARE_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?developerLabel ?programmingLanguageLabel ?copyrightLicenseLabel ?developer ?platform ?platformLabel ?programmingLanguage ?operatingSystem ?operatingSystemLabel ?sourceCodeRepository ?officialWebsite ?copyrightLicense ?inception ?softwareVersion ?follows ?followsLabel ?genre ?genreLabel ?userManual ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
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
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%<locale>s,en". }
      }
      LIMIT 1
    SPARQL

    HARDWARE_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?manufacturer ?manufacturerLabel ?model ?modelLabel ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q3966 wd:Q55990535 }
        OPTIONAL { ?entity wdt:P176 ?manufacturer . }
        OPTIONAL { ?entity wdt:P1072 ?model . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%<locale>s,en". }
      }
      LIMIT 1
    SPARQL

    GRANTS_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?funder ?funderLabel ?recipient ?recipientLabel ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q230788 }
        OPTIONAL { ?entity wdt:P8324 ?funder . }
        OPTIONAL { ?entity wdt:P8323 ?recipient . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%<locale>s,en". }
      }
      LIMIT 1
    SPARQL

    WORKS_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?author ?authorLabel ?title ?titleLabel ?publicationDate ?DOI ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q47461344 }
        OPTIONAL { ?entity wdt:P50 ?author . }
        OPTIONAL { ?entity wdt:P1476 ?title . }
        OPTIONAL { ?entity wdt:P577 ?publicationDate . }
        OPTIONAL { ?entity wdt:P356 ?doi . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%<locale>s,en". }
      }
      LIMIT 1
    SPARQL

    CASE_STUDY_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>

      SELECT ?entity ?entityLabel ?author ?authorLabel ?title ?titleLabel ?publicationDate ?license ?licenseLabel ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        ?entity wdt:P31/wdt:P279* ?instance .
        VALUES ?instance { wd:Q155207 }
        OPTIONAL { ?entity wdt:P2093 ?author . }
        OPTIONAL { ?entity wdt:P1476 ?title . }
        OPTIONAL { ?entity wdt:P577 ?publicationDate . }
        OPTIONAL { ?entity wdt:P275 ?license . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "%<locale>s,en". }
      }
      LIMIT 1
    SPARQL

    SEARCH_TEMPLATE = <<-SPARQL
      PREFIX wikibase: <http://wikiba.se/ontology#>
      PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
      PREFIX schema: <http://schema.org/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?item ?itemLabel ?description ?image ?instanceLabel WHERE {
        SERVICE wikibase:mwapi {
          bd:serviceParam wikibase:endpoint "www.wikidata.org";
                         wikibase:api "EntitySearch";
                         mwapi:search "%<query>s";
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
  end
end
