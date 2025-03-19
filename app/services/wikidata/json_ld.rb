module Wikidata
  module JsonLd
    SCHEMA_TYPE_MAPPING = {
      'Q5' => 'Person',
      'Q7397' => 'SoftwareApplication',
      'Q3966' => 'Product',
      'Q571' => 'Book',
      'Q13442814' => 'Article',
      'Q191067' => 'Article',
      'Q230788' => 'Grant',
      'Q155207' => 'CreativeWork'
    }

    PROPERTY_MAPPING = {
      'P31' => 'additionalType',
      'P577' => 'datePublished',
      'P1476' => 'name',
      'P356' => 'identifier',
      'P275' => 'license',
      'P407' => 'inLanguage',
      'P856' => 'url',
      'P921' => 'keywords',
      'P50' => 'author',
      'P2093' => 'author',
      'P57' => 'director',
      'P123' => 'publisher',
      'P953' => 'url',
      'P276' => 'contentLocation'
    }

    def self.generate(entity_data, locale = 'en')
      return {} if entity_data.nil? || !entity_data.is_a?(Hash)

      entity_id = entity_data['id']
      entity_label = entity_data.dig('labels', locale, 'value') || entity_id
      entity_description = entity_data.dig('descriptions', locale, 'value')

      schema_type = determine_schema_type(entity_data)

      json_ld = {
        "@context": "https://schema.org",
        "@type": schema_type,
        "@id": "https://www.wikidata.org/wiki/#{entity_id}",
        "name": entity_label,
        "description": entity_description,
        "identifier": entity_id
      }

      add_claims_to_json_ld(json_ld, entity_data, locale)

      json_ld
    end

    def self.format_sparql_results(results, schema)
      return {} unless results && results['results'] && results['results']['bindings'].any?

      binding = results['results']['bindings'].first
      formatted = {}

      ordered_properties = QueryBuilder::PROPERTY_ORDER[schema.to_sym] || []

      binding.each do |key, value|
        formatted[key] = value['value']
      end

      if formatted['dateModified']
        formatted['dateModified'] = Utils.humanize_date(formatted['dateModified'])
      end

      if formatted['publicationDate']
        formatted['publicationDate'] = Utils.humanize_date(formatted['publicationDate'])
      end

      if formatted['entity']
        entity_id = formatted['entity'].split('/').last
        formatted['entity'] = entity_id
      end

      formatted
    end

    def self.format_search_results(results)
      return [] unless results && results['results'] && results['results']['bindings'].any?

      results['results']['bindings'].map do |binding|
        item = {
          'id' => binding['item']['value'].split('/').last,
          'label' => binding['itemLabel']['value']
        }

        item['description'] = binding['description']['value'] if binding['description']
        item['image'] = binding['image']['value'] if binding['image']
        item['instance'] = binding['instanceLabel']['value'] if binding['instanceLabel']

        item
      end
    end

    private

    def self.determine_schema_type(entity_data)
      return 'CreativeWork' unless entity_data['claims']&.key?('P31')

      instance_of_claims = entity_data['claims']['P31'] || []
      return 'CreativeWork' if instance_of_claims.empty?

      instance_of_claims.each do |claim|
        next unless claim['mainsnak']&.dig('datavalue', 'value', 'id')

        instance_id = claim['mainsnak']['datavalue']['value']['id']
        if SCHEMA_TYPE_MAPPING.key?(instance_id)
          return SCHEMA_TYPE_MAPPING[instance_id]
        end
      end

      'CreativeWork'
    end

    def self.add_claims_to_json_ld(json_ld, entity_data, locale)
      return json_ld unless entity_data['claims'].is_a?(Hash)

      additional_props = []

      entity_data['claims'].each do |property_id, statements|
        next if statements.empty?
        next if property_id == 'P31'

        schema_property = PROPERTY_MAPPING[property_id]

        if schema_property
          process_mapped_property(json_ld, schema_property, statements, locale)
        else
          process_additional_property(additional_props, property_id, statements, locale)
        end
      end

      json_ld[:additionalProperty] = additional_props if additional_props.any?

      json_ld
    end

    def self.process_mapped_property(json_ld, schema_property, statements, locale)
      values = statements.map do |statement|
        extract_value_from_statement(statement, locale)
      end.compact

      return if values.empty?

      case schema_property
      when 'author'
        json_ld[schema_property.to_sym] = values.map do |value|
          { "@type": "Person", "name": value }
        end
      when 'keywords'
        json_ld[schema_property.to_sym] = values.join(', ')
      when 'contentLocation'
        json_ld[schema_property.to_sym] = {
          "@type": "Place",
          "name": values.first
        }
      else
        json_ld[schema_property.to_sym] = values.length == 1 ? values.first : values
      end
    end

    def self.process_additional_property(additional_props, property_id, statements, locale)
      values = statements.map do |statement|
        extract_value_from_statement(statement, locale)
      end.compact

      return if values.empty?

      additional_props << {
        "@type": "PropertyValue",
        "name": property_id,
        "value": values.length == 1 ? values.first : values
      }
    end

    def self.extract_value_from_statement(statement, locale)
      return nil unless statement['mainsnak']&.dig('datavalue')

      datavalue = statement['mainsnak']['datavalue']

      case datavalue['type']
      when 'wikibase-entityid'
        datavalue.dig('value', 'id')
      when 'string'
        datavalue['value']
      when 'monolingualtext'
        datavalue.dig('value', 'text')
      when 'time'
        time_value = datavalue.dig('value', 'time')
        time_value&.sub(/^\+/, '')
      when 'quantity'
        datavalue.dig('value', 'amount')
      else
        datavalue['value'].to_s
      end
    end
  end
end
