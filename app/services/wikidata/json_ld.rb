# frozen_string_literal: true

module Wikidata
  # Handles JSON-LD formatting and generation for Wikidata entities
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

    # Generate JSON-LD representation of entity data
    # @param entity_data [Hash] Processed entity data
    # @param locale [String] Language code for labels (default: 'en')
    # @return [Hash] JSON-LD formatted data
    def self.generate(entity_data, locale = 'en')
      return nil if entity_data.nil? || entity_data.empty?

      context = {
        '@context' => {
          '@vocab' => 'https://schema.org/',
          'wdt' => 'http://www.wikidata.org/prop/direct/',
          'wd' => 'http://www.wikidata.org/entity/'
        }
      }

      # Add basic JSON-LD structure
      json_ld = {
        '@type' => entity_data['type'] || 'Thing',
        '@id' => "wd:#{entity_data['id']}"
      }

      # Add all other properties
      entity_data.each do |key, value|
        next if ['@type', '@id', '@context'].include?(key)

        # Handle arrays
        json_ld[key] = if value.is_a?(Array)
                         value.map do |v|
                           v.to_s.start_with?('Q') ? "wd:#{v}" : v
                         end
                       else
                         value.to_s.start_with?('Q') ? "wd:#{value}" : value
                       end
      end

      # Merge context and data
      context.merge(json_ld)
    end

    # Format SPARQL query results into JSON-LD format
    # @param results [Hash] Raw SPARQL query results
    # @param schema [Symbol] Schema type for the query
    # @return [Hash] Formatted JSON-LD data
    def self.format_sparql_results(results, schema)
      return nil unless results && results['results'] && results['results']['bindings']

      bindings = results['results']['bindings']
      return nil if bindings.empty?

      # Convert the first result into JSON-LD format
      entity_data = {}

      bindings.each do |binding|
        binding.each do |key, value|
          # Skip if the value is not present
          next unless value['value']

          # Convert property keys to camelCase
          property = key.to_s.camelize(:lower)

          # Handle different value types
          processed_value = case value['type']
                            when 'uri'
                              if value['value'].include?('entity/')
                                value['value'].split('/').last
                              else
                                value['value']
                              end
                            when 'literal'
                              if value['datatype']&.include?('dateTime')
                                Wikidata.humanize_date(value['value'])
                              else
                                value['value']
                              end
                            else
                              value['value']
                            end

          # Store the processed value
          if entity_data[property].is_a?(Array)
            entity_data[property] << processed_value unless entity_data[property].include?(processed_value)
          elsif entity_data[property]
            entity_data[property] = [entity_data[property], processed_value].uniq
          else
            entity_data[property] = processed_value
          end
        end
      end

      generate(entity_data)
    end

    # Format search results into a simplified JSON-LD format
    # @param results [Hash] Raw SPARQL search results
    # @return [Hash] Formatted search results
    def self.format_search_results(results)
      return nil unless results && results['results'] && results['results']['bindings']

      bindings = results['results']['bindings']
      return nil if bindings.empty?

      formatted_results = bindings.map do |binding|
        {
          '@type' => 'Entity',
          '@id' => binding['item']&.dig('value')&.split('/')&.last,
          'name' => binding['itemLabel']&.dig('value'),
          'description' => binding['itemDescription']&.dig('value'),
          'score' => binding['score']&.dig('value')&.to_f
        }.compact
      end

      {
        '@context' => 'https://schema.org',
        '@type' => 'ItemList',
        'itemListElement' => formatted_results
      }
    end

    private

    def self.determine_schema_type(entity_data)
      return 'CreativeWork' unless entity_data['claims']&.key?('P31')

      instance_of_claims = entity_data['claims']['P31'] || []
      return 'CreativeWork' if instance_of_claims.empty?

      instance_of_claims.each do |claim|
        next unless claim['mainsnak']&.dig('datavalue', 'value', 'id')

        instance_id = claim['mainsnak']['datavalue']['value']['id']
        return SCHEMA_TYPE_MAPPING[instance_id] if SCHEMA_TYPE_MAPPING.key?(instance_id)
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

      json_ld[schema_property.to_sym] = case schema_property
                                        when 'author'
                                          values.map do |value|
                                            { "@type": 'Person', "name": value }
                                          end
                                        when 'keywords'
                                          values.join(', ')
                                        when 'contentLocation'
                                          {
                                            "@type": 'Place',
                                            "name": values.first
                                          }
                                        else
                                          values.length == 1 ? values.first : values
                                        end
    end

    def self.process_additional_property(additional_props, property_id, statements, locale)
      values = statements.map do |statement|
        extract_value_from_statement(statement, locale)
      end.compact

      return if values.empty?

      additional_props << {
        "@type": 'PropertyValue',
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
