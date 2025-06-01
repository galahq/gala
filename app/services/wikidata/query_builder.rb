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
        'P31' => 'Q155207',                                                                # Instance of: case study
        'P1476' => { value: kase.title, type: :string },                                   # Title
        'P2093' => kase.authors.map { |author| { value: author['name'], type: :string } }, # Author name strings
        'P407' => Utils.map_locale_to_language_qid(locale),                                # Language of work
        'P953' => { value: case_url(kase), type: :string },                                # Full work available at URL
        'P1433' => 'Q130549584',                                                           # Published in: Gala
        'P577' => { value: Utils.format_datetime(kase.published_at), type: :time },        # Publication date
        'P5017' => { value: Utils.format_datetime(kase.updated_at), type: :time },         # Last update
        'P6216' => 'Q50423863',                                                            # Copyright status: copyrighted
        'P275' => Utils.map_license_to_qid(kase.license)                                   # License
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
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT DISTINCT ?entity ?entityLabel ?occupationLabel ?disciplineLabel ?ORCID ?SCOPUS ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        {
          # Match researchers by instance
          ?entity wdt:P31/wdt:P279* ?instance .
          VALUES ?instance { wd:Q5 }  # human
        }
        UNION
        {
          # Match by occupation
          ?entity wdt:P106 ?occupation .
          VALUES ?occupation {#{' '}
            wd:Q1650915    # researcher
            wd:Q1622272    # university teacher
            wd:Q169470     # scientist
          }
        }
        OPTIONAL {#{' '}
          ?entity wdt:P106 ?occupation .
          ?occupation rdfs:label ?occupationLabel .
          FILTER(LANG(?occupationLabel) = "%<locale>s")
        }
        OPTIONAL {#{' '}
          ?entity wdt:P101 ?discipline .
          ?discipline rdfs:label ?disciplineLabel .
          FILTER(LANG(?disciplineLabel) = "%<locale>s")
        }
        OPTIONAL { ?entity wdt:P496 ?ORCID . }
        OPTIONAL { ?entity wdt:P1153 ?SCOPUS . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
      #{'  '}
        # Get the entity label in the current locale
        ?entity rdfs:label ?entityLabel .
        FILTER(LANG(?entityLabel) = "%<locale>s")
      }
    SPARQL

    SOFTWARE_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT DISTINCT ?entity ?entityLabel ?developerLabel ?programmingLanguageLabel ?copyrightLicenseLabel ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        {
          # Match by instance
          ?entity wdt:P31/wdt:P279* ?instance .
          VALUES ?instance {
            wd:Q341       # software
            wd:Q7397      # software product
            wd:Q1639024   # software library
            wd:Q21127166  # software tool
            wd:Q21129801  # application software
            wd:Q24529812  # software suite
            wd:Q9143      # programming tool
          }
        }
        UNION
        {
          # Match by programming language used
          ?entity wdt:P277 ?programmingLanguage .
        }
        UNION
        {
          # Match by software license
          ?entity wdt:P275 ?copyrightLicense .
        }
        OPTIONAL {#{' '}
          ?entity wdt:P178 ?developer .
          ?developer rdfs:label ?developerLabel .
          FILTER(LANG(?developerLabel) = "%<locale>s")
        }
        OPTIONAL {#{' '}
          ?entity wdt:P277 ?programmingLanguage .
          ?programmingLanguage rdfs:label ?programmingLanguageLabel .
          FILTER(LANG(?programmingLanguageLabel) = "%<locale>s")
        }
        OPTIONAL {#{' '}
          ?entity wdt:P275 ?copyrightLicense .
          ?copyrightLicense rdfs:label ?copyrightLicenseLabel .
          FILTER(LANG(?copyrightLicenseLabel) = "%<locale>s")
        }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
      #{'  '}
        # Get the entity label in the current locale
        ?entity rdfs:label ?entityLabel .
        FILTER(LANG(?entityLabel) = "%<locale>s")
      }
    SPARQL

    HARDWARE_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?entity ?entityLabel ?manufacturerLabel ?modelLabel ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        {
          # Match items that are instances of our target types
          ?entity wdt:P31/wdt:P279* ?instance .
          VALUES ?instance {
            wd:Q3966      # computing platform
            wd:Q55990535  # computer hardware
            wd:Q3918      # computer
            wd:Q5741755   # model series
            wd:Q205663    # laptop
            wd:Q16338     # computer model
            wd:Q11019     # machine
            wd:Q42178     # medical equipment
            wd:Q1418916   # scientific instrument
            wd:Q1406782   # medical device
            wd:Q7946      # medical imaging
            wd:Q865950    # medical imaging technique
            wd:Q1130681   # medical test
            wd:Q1057068   # medical procedure
          }
        }
        UNION
        {
          # Match items that are subclasses of our target types
          ?entity wdt:P279+ ?class .
          VALUES ?class {
            wd:Q7946      # medical imaging
            wd:Q865950    # medical imaging technique
            wd:Q1130681   # medical test
            wd:Q1057068   # medical procedure
          }
        }
        UNION
        {
          # Also match the exact types themselves
          VALUES ?entity {
            wd:Q7946      # medical imaging
            wd:Q865950    # medical imaging technique
            wd:Q1130681   # medical test
            wd:Q1057068   # medical procedure
          }
        }
        OPTIONAL {#{' '}
          ?entity wdt:P176 ?manufacturer .
          ?manufacturer rdfs:label ?manufacturerLabel .
          FILTER(LANG(?manufacturerLabel) = "%<locale>s")
        }
        OPTIONAL {#{' '}
          ?entity wdt:P31 ?model .
          ?model rdfs:label ?modelLabel .
          FILTER(LANG(?modelLabel) = "%<locale>s")
        }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
      #{'  '}
        # Get the entity label in the current locale
        ?entity rdfs:label ?entityLabel .
        FILTER(LANG(?entityLabel) = "%<locale>s")
      }
    SPARQL

    GRANTS_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?entity ?entityLabel ?funderLabel ?recipientLabel ?fundedBy ?fundedByLabel ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        {
          ?entity wdt:P31/wdt:P279* ?instance .
          VALUES ?instance { wd:Q230788 }
        }
        UNION
        {
          # Also match items that are funded by grants
          ?entity wdt:P11814 ?fundedBy .
          ?fundedBy rdfs:label ?fundedByLabel .
          FILTER(LANG(?fundedByLabel) = "%<locale>s")
        }
        OPTIONAL {#{' '}
          ?entity wdt:P8324 ?funder .
          ?funder rdfs:label ?funderLabel .
          FILTER(LANG(?funderLabel) = "%<locale>s")
        }
        OPTIONAL {#{' '}
          ?entity wdt:P8323 ?recipient .
          ?recipient rdfs:label ?recipientLabel .
          FILTER(LANG(?recipientLabel) = "%<locale>s")
        }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
      #{'  '}
        # Get the entity label in the current locale
        ?entity rdfs:label ?entityLabel .
        FILTER(LANG(?entityLabel) = "%<locale>s")
      }
    SPARQL

    WORKS_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?entity ?entityLabel ?authorLabel ?titleLabel ?publicationDate ?DOI ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        {
          # Match scholarly articles
          ?entity wdt:P31/wdt:P279* ?instance .
          VALUES ?instance {
            wd:Q47461344   # scholarly article
            wd:Q13442814   # scientific article
            wd:Q571        # book
            wd:Q191067     # article
            wd:Q1980247    # chapter
          }
        }
        UNION
        {
          # Match by DOI
          ?entity wdt:P356 ?doi .
        }
        UNION
        {
          # Match by author and publication date
          ?entity wdt:P50 ?author ;
                 wdt:P577 ?publicationDate .
        }
        OPTIONAL {#{' '}
          ?entity wdt:P50 ?author .
          ?author rdfs:label ?authorLabel .
          FILTER(LANG(?authorLabel) = "%<locale>s")
        }
        OPTIONAL {#{' '}
          ?entity wdt:P1476 ?title .
          ?title rdfs:label ?titleLabel .
          FILTER(LANG(?titleLabel) = "%<locale>s")
        }
        OPTIONAL { ?entity wdt:P577 ?publicationDate . }
        OPTIONAL { ?entity wdt:P356 ?DOI . }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
      #{'  '}
        # Get the entity label in the current locale
        ?entity rdfs:label ?entityLabel .
        FILTER(LANG(?entityLabel) = "%<locale>s")
      }
    SPARQL

    CASE_STUDY_TEMPLATE = <<-SPARQL
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX schema: <http://schema.org/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT ?entity ?entityLabel ?authorLabel ?titleLabel ?publicationDate ?licenseLabel ?dateModified WHERE {
        BIND(wd:%<qid>s AS ?entity)
        {
          # Match by instance
          ?entity wdt:P31/wdt:P279* ?instance .
          VALUES ?instance {
            wd:Q155207     # case study
            wd:Q1713326    # teaching case
          }
        }
        UNION
        {
          # Match by genre
          ?entity wdt:P136 ?genre .
          VALUES ?genre { wd:Q155207 }  # case study
        }
        UNION
        {
          # Match by author and title
          ?entity wdt:P2093 ?author ;
                 wdt:P1476 ?title .
        }
        OPTIONAL {#{' '}
          ?entity wdt:P2093 ?author .
          ?author rdfs:label ?authorLabel .
          FILTER(LANG(?authorLabel) = "%<locale>s")
        }
        OPTIONAL {#{' '}
          ?entity wdt:P1476 ?title .
          ?title rdfs:label ?titleLabel .
          FILTER(LANG(?titleLabel) = "%<locale>s")
        }
        OPTIONAL { ?entity wdt:P577 ?publicationDate . }
        OPTIONAL {#{' '}
          ?entity wdt:P275 ?license .
          ?license rdfs:label ?licenseLabel .
          FILTER(LANG(?licenseLabel) = "%<locale>s")
        }
        OPTIONAL { ?entity schema:dateModified ?dateModified . }
      #{'  '}
        # Get the entity label in the current locale
        ?entity rdfs:label ?entityLabel .
        FILTER(LANG(?entityLabel) = "%<locale>s")
      }
    SPARQL

    SEARCH_TEMPLATE = <<-SPARQL
      PREFIX wikibase: <http://wikiba.se/ontology#>
      PREFIX mwapi: <https://www.mediawiki.org/ontology#API/>
      PREFIX schema: <http://schema.org/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX wd: <http://www.wikidata.org/entity/>

      SELECT DISTINCT ?item ?itemLabel ?description ?image ?instanceLabel ?score WHERE {
        SERVICE wikibase:mwapi {
          bd:serviceParam wikibase:endpoint "www.wikidata.org";
                         wikibase:api "EntitySearch";
                         mwapi:search "%<query>s";
                         mwapi:language "en";
                         mwapi:limit "20".
          ?item wikibase:apiOutputItem mwapi:item.
          ?num wikibase:apiOrdinal true.
        }

        ?item rdfs:label ?itemLabel.
        FILTER(LANG(?itemLabel) = "en")

        # Get instance types
        OPTIONAL {
          ?item wdt:P31 ?directInstance.
          ?directInstance rdfs:label ?instanceLabel.
          FILTER(LANG(?instanceLabel) = "en")
        }
        OPTIONAL {
          ?item wdt:P31/wdt:P279* ?instance.
          VALUES ?instance {#{' '}
            wd:Q3966      # computing platform
            wd:Q55990535  # computer hardware
            wd:Q3918      # computer
            wd:Q5741755   # model series
            wd:Q205663    # laptop
            wd:Q16338     # computer model
            wd:Q11019     # machine
            wd:Q42178     # medical equipment
            wd:Q1418916   # scientific instrument
            wd:Q1406782   # medical device
            wd:Q7946      # medical imaging
            wd:Q865950    # medical imaging technique
            wd:Q1130681   # medical test
            wd:Q1057068   # medical procedure
          }
        }

        OPTIONAL {
          ?item schema:description ?description.
          FILTER(LANG(?description) = "en")
        }
        OPTIONAL { ?item wdt:P18 ?image }

        BIND(1/xsd:float(?num) AS ?score)
      }
      ORDER BY DESC(?score)
      LIMIT 10
    SPARQL

    class << self
      def property_order(schema)
        # Extract variables from the SELECT clause of the corresponding template
        template = get_template(schema)
        return [] unless template

        # Find the SELECT line and extract variables
        select_line = template.lines.find { |line| line.strip.start_with?('SELECT') }
        return [] unless select_line

        # Extract variable names (without ? prefix) and remove Label suffix
        variables = select_line.scan(/\?(\w+)/).flatten
        variables.reject { |v| v.end_with?('Label') || v == 'entity' || v == 'dateModified' }
      end

      private

      def get_template(schema)
        case schema.to_sym
        when :researchers then RESEARCHERS_TEMPLATE
        when :software then SOFTWARE_TEMPLATE
        when :hardware then HARDWARE_TEMPLATE
        when :grants then GRANTS_TEMPLATE
        when :works then WORKS_TEMPLATE
        when :case_study then CASE_STUDY_TEMPLATE
        end
      end
    end
  end
end
