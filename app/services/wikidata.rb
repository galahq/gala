# frozen_string_literal: true

require 'oauth2'
require 'json'
require 'date'
require 'uri'
require 'net/http'
require 'active_support/core_ext/string/inflections'
require 'redis'

require_relative 'wikidata/utils'
require_relative 'wikidata/query_builder'
require_relative 'wikidata/json_ld'
require_relative 'wikidata/sync_service'

module Wikidata
  API_URL = 'https://www.wikidata.org/w/api.php'
  REST_API_URL = 'https://www.wikidata.org/w/rest.php/wikibase/v0'
  ENTITY_URL = 'https://www.wikidata.org/wiki/Special:EntityData'
  SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'

  REDIS_TOKEN_KEY = 'wikidata:access_token'
  TOKEN_EXPIRATION = 3600

  class Error < StandardError; end
  class AuthenticationError < Error; end
  class QueryError < Error; end

  @access_token = nil
  @edit_token = nil

  # Initialize the module with required environment variables
  def self.initialize!
    return if ENV['WIKIDATA_OAUTH2_CLIENT_ID'].present? && ENV['WIKIDATA_OAUTH2_CLIENT_SECRET'].present?

    raise AuthenticationError,
          'Missing required OAuth2 credentials. Please set WIKIDATA_OAUTH2_CLIENT_ID and WIKIDATA_OAUTH2_CLIENT_SECRET.'
  end

  # Utility methods for date and string formatting

  # Format date string in a human-readable format
  # @param date_string [String] The date string to format
  # @return [String] Formatted date string
  def self.humanize_date(date_string)
    # Handle Wikidata time format (+1920-01-01T00:00:00Z)
    date_string = date_string.gsub(/^\+/, '') if date_string.start_with?('+')
    DateTime.parse(date_string).strftime('%B %d, %Y')
  rescue StandardError
    date_string
  end

  # Convert property ID or camelCase to human-readable format
  # @param subject [String] The string to humanize
  # @return [String] Human-readable string
  def self.humanize_sparql_subject(subject)
    if subject.match?(/^P\d+$/)
      # It's a property ID, try to get a better name
      subject
    elsif subject == subject.upcase
      subject
    else
      subject.gsub(/([a-z])([A-Z])/, '\1 \2').humanize
    end
  end

  # Check if Redis is available for use
  # @return [Boolean] True if Redis is available
  def self.redis
    @redis ||= Rails.cache.redis || Redis.new(url: ENV['REDIS_URL'])
  rescue StandardError => e
    Rails.logger.warn("Redis connection failed: #{e.message}")
    nil
  end

  # Get the current access token from Redis or class variable
  # @return [String, nil] The current access token or nil if not set
  def self.access_token
    if redis_client = redis
      begin
        token = redis_client.get(REDIS_TOKEN_KEY)
        return token if token.present?
      rescue StandardError => e
        Rails.logger.warn("Failed to get Wikidata token from Redis: #{e.message}")
      end
    end

    @access_token || ENV['WIKIDATA_OAUTH2_ACCESS_TOKEN']
  end

  # Set the current access token in Redis and class variable
  # @param token [String] The access token to store
  # @param expiration [Integer] Token expiration time in seconds
  # @return [String] The token that was set
  def self.access_token=(token)
    @access_token = token

    if redis_client = redis
      begin
        redis_client.setex(REDIS_TOKEN_KEY, TOKEN_EXPIRATION, token)
      rescue StandardError => e
        Rails.logger.warn("Failed to store Wikidata token in Redis: #{e.message}")
      end
    end

    token
  end

  # Check if the current OAuth2 access token has expired
  # @return [Boolean] True if token is expired or invalid, false if it's valid
  def self.token_expired?
    return true unless access_token.present?

    begin
      uri = URI(API_URL)
      params = {
        action: 'query',
        meta: 'userinfo',
        format: 'json'
      }
      uri.query = URI.encode_www_form(params)

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true

      request = Net::HTTP::Get.new(uri.request_uri)
      request['Authorization'] = "Bearer #{access_token}"

      response = http.request(request)

      if response.is_a?(Net::HTTPSuccess)
        result = JSON.parse(response.body)
        return false if result && result['query'] && result['query']['userinfo']
      end

      # Default to assuming the token is expired if any issues
      true
    rescue StandardError => e
      Rails.logger.error("Unexpected error checking token validity: #{e.message}")
      true
    end
  end

  # Fetch and store a new access token using client credentials
  # @return [String, nil] The new access token or nil if authentication failed
  def self.refresh_access_token
    client_id = ENV['WIKIDATA_OAUTH2_CLIENT_ID']
    client_secret = ENV['WIKIDATA_OAUTH2_CLIENT_SECRET']

    return nil unless client_id && client_secret

    begin
      oauth2_client = OAuth2::Client.new(
        client_id,
        client_secret,
        site: 'https://www.wikidata.org',
        token_url: '/w/rest.php/oauth2/access_token'
      )

      token = oauth2_client.client_credentials.get_token
      self.access_token = token.token
    rescue OAuth2::Error => e
      Rails.logger.error "OAuth2 authentication failed: #{e.message}"
      raise AuthenticationError, "Failed to authenticate with Wikidata: #{e.message}"
    end
  end

  # Get a valid access token, refreshing it if expired
  # @return [String, nil] A valid access token or nil if unable to get one
  def self.ensure_valid_token
    if token_expired?
      refresh_access_token
    else
      access_token
    end
  end

  def self.edit_token
    return @edit_token if @edit_token

    response = make_api_request('query', meta: 'tokens')
    @edit_token = response&.dig('query', 'tokens', 'csrftoken')
  end

  # HTTP request methods

  def self.make_api_request(action, **params)
    url = API_URL
    params = { action: action, format: 'json' }.merge(params)

    headers = {}
    if token = access_token
      headers['Authorization'] = "Bearer #{token}"
    end

    response = make_http_request(url, params, headers)

    if response && response['error']
      error_message = "Wikidata API error: #{response['error']['code']} - #{response['error']['info']}"
      Rails.logger.error error_message
      raise Error, error_message
    end

    response
  end

  def self.make_http_request(url, params = {}, headers = {})
    uri = URI(url)

    uri.query = URI.encode_www_form(params) if params.any?

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Get.new(uri.request_uri)
    headers.each { |key, value| request[key] = value }

    begin
      response = http.request(request)
      return JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)

      error_message = "HTTP request failed: #{response.code} - #{response.message}"
      Rails.logger.error error_message
      raise Error, error_message
    rescue StandardError => e
      Rails.logger.error "HTTP request failed: #{e.message}"
      raise Error, "HTTP request failed: #{e.message}"
    end
  end

  def self.execute_sparql_query(query)
    uri = URI(SPARQL_ENDPOINT)

    headers = {
      'Accept' => 'application/sparql-results+json',
      'User-Agent' => 'GalaResearch/1.0 (https://gala.university; info@gala.university)'
    }

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri.request_uri, headers)
    request.set_form_data({ query: query })

    begin
      response = http.request(request)

      return JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)

      error_message = "SPARQL query failed: #{response.code} - #{response.message}"
      Rails.logger.error error_message
      Rails.logger.debug "Query: #{query}"
      raise QueryError, error_message
    rescue StandardError => e
      Rails.logger.error "SPARQL query execution error: #{e.message}"
      Rails.logger.debug "Query: #{query}"
      raise QueryError, "SPARQL query execution error: #{e.message}"
    end
  end

  # Entity operations

  def self.create_entity(label, description = nil, locale = 'en')
    ensure_valid_token

    response = make_api_request(
      'wbeditentity',
      new: 'item',
      token: edit_token,
      data: JSON.generate({
                            labels: { locale => { language: locale, value: label } },
                            descriptions: description ? { locale => { language: locale, value: description } } : {}
                          })
    )

    response&.dig('entity', 'id')
  end

  def self.update_entity(qid, label, description = nil, locale = 'en')
    ensure_valid_token

    response = make_api_request(
      'wbeditentity',
      id: qid,
      token: edit_token,
      data: JSON.generate({
                            labels: { locale => { language: locale, value: label } },
                            descriptions: description ? { locale => { language: locale, value: description } } : {}
                          })
    )

    response.present?
  end

  def self.get_entity(qid, locale = 'en')
    url = "#{ENTITY_URL}/#{qid}.json"
    response = make_http_request(url)

    return nil unless response && response['entities']

    response['entities'][qid]
  end

  def self.add_claims(qid, properties)
    ensure_valid_token

    results = []
    properties.each do |property_id, value|
      values = value.is_a?(Array) ? value : [value]

      values.each do |v|
        claim_value = Utils.format_claim_value(v)
        next unless claim_value

        response = make_api_request(
          'wbcreateclaim',
          entity: qid,
          property: property_id,
          token: edit_token,
          snaktype: 'value',
          value: JSON.generate(claim_value)
        )

        results << response.present?
      end
    end

    results.all?
  end

  def self.search_entities(query, limit = 10, language = 'en')
    response = make_api_request(
      'wbsearchentities',
      search: query,
      language: language,
      limit: limit,
      type: 'item'
    )

    response&.dig('search') || []
  end

  # Query operations

  def self.query_entity(schema, qid, locale = 'en')
    query = QueryBuilder.build_query(schema, qid, locale)
    results = execute_sparql_query(query)
    JsonLd.format_sparql_results(results, schema)
  rescue QueryError => e
    Rails.logger.error "Failed to query entity: #{e.message}"
    nil
  end

  def self.search(query_string, locale = 'en')
    query = QueryBuilder.build_search_query(query_string)
    results = execute_sparql_query(query)
    JsonLd.format_search_results(results)
  rescue QueryError => e
    Rails.logger.error "Failed to search entities: #{e.message}"
    nil
  end

  def self.generate_json_ld(entity_data, locale = 'en')
    JsonLd.generate(entity_data, locale)
  end

  # Sync operations

  def self.sync_case!(kase, locale = 'en')
    SyncService.sync!(kase, locale)
  end
end

# Initialize the module when it's loaded
Wikidata.initialize!

# Require all component files
require_relative 'wikidata/json_ld_generator'
require_relative 'wikidata/client'
require_relative 'wikidata/query_templates'
require_relative 'wikidata/query_service'

# Define the Wikidata module namespace
module Wikidata
  # This file ensures the Wikidata module namespace is properly defined
  # before any of the child classes are loaded.
end
