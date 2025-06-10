# frozen_string_literal: true

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

  # Bot credentials for POC - hardcoded as requested
  BOT_USERNAME = 'GalaSyncService'
  BOT_PASSWORD = 'GalaSyncService@uh4f9i23ip9nojj15vt9obm8lsn7c3lo'

  REDIS_SESSION_KEY = 'wikidata:session_cookies'
  SESSION_EXPIRATION = 3600

  class Error < StandardError; end
  class AuthenticationError < Error; end
  class QueryError < Error; end

  @session_cookies = nil
  @edit_token = nil
  @logged_in = false

  # Initialize the module
  def self.initialize!
    # No longer need OAuth2 credentials validation
    Rails.logger.info 'Wikidata module initialized with bot authentication'
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

  # Get the current session cookies from Redis or class variable
  # @return [String, nil] The current session cookies or nil if not set
  def self.session_cookies
    if redis_client = redis
      begin
        cookies = redis_client.get(REDIS_SESSION_KEY)
        return cookies if cookies.present?
      rescue StandardError => e
        Rails.logger.warn("Failed to get Wikidata session from Redis: #{e.message}")
      end
    end

    @session_cookies
  end

  # Set the current session cookies in Redis and class variable
  # @param cookies [String] The session cookies to store
  # @return [String] The cookies that were set
  def self.session_cookies=(cookies)
    @session_cookies = cookies
    @logged_in = true

    if redis_client = redis
      begin
        redis_client.setex(REDIS_SESSION_KEY, SESSION_EXPIRATION, cookies)
      rescue StandardError => e
        Rails.logger.warn("Failed to store Wikidata session in Redis: #{e.message}")
      end
    end

    cookies
  end

  # Check if we're currently logged in
  # @return [Boolean] True if logged in and session is valid
  def self.logged_in?
    return false unless session_cookies.present?

    begin
      response = make_api_request('query', meta: 'userinfo')
      user_info = response&.dig('query', 'userinfo')

      # If we get user info and we're not anonymous, we're logged in
      user_info && user_info['name'].present? && user_info['name'] != 'anonymous'
    rescue StandardError => e
      Rails.logger.error("Error checking login status: #{e.message}")
      false
    end
  end

  # Bot login using the provided credentials
  # @return [Boolean] True if login was successful
  def self.bot_login
    Rails.logger.info "Attempting bot login for: #{BOT_USERNAME}"

    begin
      # Reset session state
      @session_cookies = nil
      @logged_in = false

      # First, get a login token without authentication
      login_token_response = make_http_request(API_URL, {
                                                 action: 'query',
                                                 meta: 'tokens',
                                                 type: 'login',
                                                 format: 'json'
                                               }, {}, :get)

      login_token = login_token_response&.dig('query', 'tokens', 'logintoken')
      return false unless login_token.present?

      # Store any session cookies from the token request
      self.session_cookies = login_token_response['_cookies'] if login_token_response['_cookies']

      # Perform the login using legacy login method for bot
      login_response = make_http_request(API_URL, {
                                           action: 'login',
                                           lgname: BOT_USERNAME,
                                           lgpassword: BOT_PASSWORD,
                                           lgtoken: login_token,
                                           format: 'json'
                                         }, session_cookies ? { 'Cookie' => session_cookies } : {}, :post)

      # Store session cookies from login response
      self.session_cookies = login_response['_cookies'] if login_response['_cookies']

      if login_response&.dig('login', 'result') == 'Success'
        Rails.logger.info "Successfully logged in as bot: #{BOT_USERNAME}"
        @logged_in = true
        true
      else
        error_message = login_response&.dig('login', 'reason') || 'Unknown login error'
        Rails.logger.error "Bot login failed: #{error_message}"
        Rails.logger.debug "Login response: #{login_response}"
        false
      end
    rescue StandardError => e
      Rails.logger.error "Bot login error: #{e.message}"
      Rails.logger.error e.backtrace.first(5).join('; ')
      false
    end
  end

  # Ensure we have a valid session, logging in if needed
  # @return [Boolean] True if we have a valid session
  def self.ensure_logged_in
    return true if logged_in?

    bot_login
  end

  # Get edit token for making changes
  def self.edit_token
    return @edit_token if @edit_token && logged_in?

    ensure_logged_in
    response = make_api_request('query', meta: 'tokens')
    @edit_token = response&.dig('query', 'tokens', 'csrftoken')
  end

  # HTTP request methods

  def self.make_api_request(action, **params)
    url = API_URL
    params = { action: action, format: 'json' }.merge(params)

    headers = {}
    if cookies = session_cookies
      headers['Cookie'] = cookies
    end

    response = make_http_request(url, params, headers, :get)

    if response && response['error']
      error_message = "Wikidata API error: #{response['error']['code']} - #{response['error']['info']}"
      Rails.logger.error error_message
      raise Error, error_message
    end

    response
  end

  def self.make_post_request(action, **params)
    url = API_URL
    params = { action: action, format: 'json' }.merge(params)

    headers = {}
    if cookies = session_cookies
      headers['Cookie'] = cookies
    end

    response = make_http_request(url, params, headers, :post)

    # Extract and store session cookies from response
    self.session_cookies = response['_cookies'] if response.is_a?(Hash) && response.has_key?('_cookies')

    if response && response['error']
      error_message = "Wikidata API error: #{response['error']['code']} - #{response['error']['info']}"
      Rails.logger.error error_message
      raise Error, error_message
    end

    response
  end

  def self.make_http_request(url, params = {}, headers = {}, method = :get)
    uri = URI(url)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    if method == :post
      request = Net::HTTP::Post.new(uri.request_uri)
      request.set_form_data(params)
    else
      uri.query = URI.encode_www_form(params) if params.any?
      request = Net::HTTP::Get.new(uri.request_uri)
    end

    headers.each { |key, value| request[key] = value }

    begin
      response = http.request(request)

      # Store cookies for session management
      if response['Set-Cookie']
        cookies = response.get_fields('Set-Cookie').join('; ')
        result = JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)
        result['_cookies'] = cookies if result.is_a?(Hash)
        return result
      end

      return JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)

      error_message = "HTTP request failed: #{response.code} - #{response.message}"
      Rails.logger.error error_message
      raise Error, error_message
    rescue JSON::ParserError => e
      Rails.logger.error "Failed to parse JSON response: #{e.message}"
      raise Error, "Failed to parse JSON response: #{e.message}"
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

  def self.create_entity(label, description = nil, locale = 'en', dry_run: false)
    if dry_run
      Rails.logger.info "DRY RUN: Would create Wikidata entity with label: '#{label}'"
      Rails.logger.info "DRY RUN: Would set description: '#{description}'" if description.present?
      Rails.logger.info "DRY RUN: Would use locale: #{locale}"

      # Return a mock QID for dry run
      mock_qid = "DRY-RUN-Q#{rand(1_000_000..9_999_999)}"
      Rails.logger.info "DRY RUN: Would return mock QID: #{mock_qid}"
      return mock_qid
    end

    ensure_logged_in

    Rails.logger.info "Creating Wikidata entity with label: '#{label}'"

    response = make_post_request(
      'wbeditentity',
      new: 'item',
      token: edit_token,
      data: JSON.generate({
                            labels: { locale => { language: locale, value: label } },
                            descriptions: description ? { locale => { language: locale, value: description } } : {}
                          })
    )

    qid = response&.dig('entity', 'id')

    if qid.present?
      Rails.logger.info "Successfully created Wikidata entity with QID: #{qid}"
    else
      Rails.logger.error "Failed to create Wikidata entity for label: '#{label}'"
    end

    qid
  end

  def self.update_entity(qid, label, description = nil, locale = 'en', dry_run: false)
    if dry_run
      Rails.logger.info "DRY RUN: Would update Wikidata entity QID: #{qid} with label: '#{label}'"
      Rails.logger.info "DRY RUN: Would set description: '#{description}'" if description.present?
      Rails.logger.info "DRY RUN: Would use locale: #{locale}"
      Rails.logger.info "DRY RUN: Would successfully update entity QID: #{qid}"
      return true
    end

    ensure_logged_in

    Rails.logger.info "Updating Wikidata entity QID: #{qid} with label: '#{label}'"

    response = make_post_request(
      'wbeditentity',
      id: qid,
      token: edit_token,
      data: JSON.generate({
                            labels: { locale => { language: locale, value: label } },
                            descriptions: description ? { locale => { language: locale, value: description } } : {}
                          })
    )

    success = response.present?

    if success
      Rails.logger.info "Successfully updated Wikidata entity QID: #{qid}"
    else
      Rails.logger.error "Failed to update Wikidata entity QID: #{qid}"
    end

    success
  end

  def self.get_entity(qid, locale = 'en')
    Rails.logger.info "Retrieving Wikidata entity QID: #{qid}"

    url = "#{ENTITY_URL}/#{qid}.json"
    response = make_http_request(url)

    return nil unless response && response['entities']

    entity = response['entities'][qid]

    if entity.present?
      Rails.logger.info "Successfully retrieved Wikidata entity QID: #{qid}"
    else
      Rails.logger.warn "Wikidata entity not found for QID: #{qid}"
    end

    entity
  end

  def self.add_claims(qid, properties, dry_run: false)
    if dry_run
      Rails.logger.info "DRY RUN: Would add claims to Wikidata entity QID: #{qid} (#{properties.keys.size} properties)"

      properties.each do |property_id, value|
        values = value.is_a?(Array) ? value : [value]
        values.each do |v|
          claim_value = Utils.format_claim_value(v)
          next unless claim_value

          display_value = claim_value.is_a?(Hash) ? claim_value.inspect : claim_value
          Rails.logger.info "DRY RUN: Would add claim to QID: #{qid}, property: #{property_id}, value: #{display_value}"
        end
      end

      Rails.logger.info "DRY RUN: Would successfully add all claims to Wikidata entity QID: #{qid}"
      return true
    end

    ensure_logged_in

    Rails.logger.info "Adding claims to Wikidata entity QID: #{qid} (#{properties.keys.size} properties)"

    results = []
    properties.each do |property_id, value|
      values = value.is_a?(Array) ? value : [value]

      values.each do |v|
        claim_value = Utils.format_claim_value(v)
        next unless claim_value

        Rails.logger.debug "Adding claim to QID: #{qid}, property: #{property_id}"

        response = make_post_request(
          'wbcreateclaim',
          entity: qid,
          property: property_id,
          token: edit_token,
          snaktype: 'value',
          value: JSON.generate(claim_value)
        )

        success = response.present?
        results << success

        if success
          Rails.logger.debug "Successfully added claim to QID: #{qid}, property: #{property_id}"
        else
          Rails.logger.error "Failed to add claim to QID: #{qid}, property: #{property_id}"
        end
      end
    end

    overall_success = results.all?

    if overall_success
      Rails.logger.info "Successfully added all claims to Wikidata entity QID: #{qid}"
    else
      Rails.logger.error "Failed to add some claims to Wikidata entity QID: #{qid}"
    end

    overall_success
  end

  def self.search_entities(query, limit = 10, language = 'en')
    Rails.logger.info "Searching Wikidata entities for query: '#{query}' (limit: #{limit})"

    response = make_api_request(
      'wbsearchentities',
      search: query,
      language: language,
      limit: limit,
      type: 'item'
    )

    results = response&.dig('search') || []

    if results.any?
      qids = results.map { |result| result['id'] }.compact
      Rails.logger.info "Found #{results.size} Wikidata entities for query: '#{query}' (QIDs: #{qids.join(', ')})"
    else
      Rails.logger.info "No Wikidata entities found for query: '#{query}'"
    end

    results
  end

  # Query operations

  def self.query_entity(schema, qid, locale = 'en')
    Rails.logger.info "Querying Wikidata entity QID: #{qid} with schema: #{schema}"

    query = QueryBuilder.build_query(schema, qid, locale)
    results = execute_sparql_query(query)
    formatted_results = JsonLd.format_sparql_results(results, schema)

    Rails.logger.info "Successfully queried Wikidata entity QID: #{qid}"
    formatted_results
  rescue QueryError => e
    Rails.logger.error "Failed to query Wikidata entity QID: #{qid} - #{e.message}"
    nil
  end

  def self.search(query_string, locale = 'en')
    Rails.logger.info "Performing SPARQL search for query: '#{query_string}'"

    query = QueryBuilder.build_search_query(query_string)
    results = execute_sparql_query(query)
    formatted_results = JsonLd.format_search_results(results)

    if formatted_results && formatted_results.any?
      qids = formatted_results.map { |result| result['@id'] }.compact.map { |id| id.split('/').last }
      Rails.logger.info "SPARQL search found #{formatted_results.size} results for query: '#{query_string}' (QIDs: #{qids.join(', ')})"
    else
      Rails.logger.info "SPARQL search found no results for query: '#{query_string}'"
    end

    formatted_results
  rescue QueryError => e
    Rails.logger.error "Failed to perform SPARQL search for query: '#{query_string}' - #{e.message}"
    nil
  end

  def self.generate_json_ld(entity_data, locale = 'en')
    JsonLd.generate(entity_data, locale)
  end

  # Sync operations

  def self.sync_case!(kase, locale = 'en', dry_run: true)
    if dry_run
      Rails.logger.info "DRY RUN: Starting Wikidata sync for case ID: #{kase.id} (#{kase.title})"
    else
      Rails.logger.info "Starting Wikidata sync for case ID: #{kase.id} (#{kase.title})"
    end

    qid = SyncService.sync!(kase, locale, dry_run: dry_run)

    if dry_run
      Rails.logger.info "DRY RUN: Would have synced case ID: #{kase.id} to Wikidata QID: #{qid}"
    elsif qid.present?
      Rails.logger.info "Successfully synced case ID: #{kase.id} to Wikidata QID: #{qid}"
    else
      Rails.logger.error "Failed to sync case ID: #{kase.id} to Wikidata"
    end

    qid
  end
end

# Initialize the module when it's loaded
Wikidata.initialize!

# Require all component files
# require_relative 'wikidata/client'
# require_relative 'wikidata/query_templates'
# require_relative 'wikidata/query_service'

# Define the Wikidata module namespace
module Wikidata
  # This file ensures the Wikidata module namespace is properly defined
  # before any of the child classes are loaded.
end
