# frozen_string_literal: true

require 'json'
require 'net/http'
require 'uri'

class SparqlJsonClient
  DEFAULT_HEADERS = {
    'Accept' => 'application/sparql-results+json',
    'User-Agent' => 'Gala Wikidata client'
  }.freeze

  def initialize(endpoint, open_timeout: 5, read_timeout: 15)
    @endpoint = URI(endpoint)
    @open_timeout = open_timeout
    @read_timeout = read_timeout
  end

  def query(sparql)
    response = request(uri_for(sparql))
    JSON.parse(response.body)
        .dig('results', 'bindings')
        .then { |bindings| Array(bindings) }
        .map { |binding| flatten_binding(binding) }
  end

  private

  def uri_for(sparql)
    uri = @endpoint.dup
    uri.query = URI.encode_www_form(query: sparql, format: 'json')
    uri
  end

  def request(uri)
    request = Net::HTTP::Get.new(uri, DEFAULT_HEADERS)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    http.open_timeout = @open_timeout
    http.read_timeout = @read_timeout

    http.request(request).tap(&:value)
  end

  def flatten_binding(binding)
    binding.each_with_object({}) do |(key, value), result|
      result[key.to_sym] = value['value']
    end
  end
end
