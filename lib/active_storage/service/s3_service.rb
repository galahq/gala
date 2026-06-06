# frozen_string_literal: true

require 'active_storage/service'
require 'base64'
require 'cgi'
require 'digest'
require 'json'
require 'net/http'
require 'openssl'
require 'stringio'
require 'tempfile'
require 'time'
require 'uri'

module ActiveStorage
    class Service::S3Service < Service
    CHUNK_SIZE = 5 * 1024 * 1024
    EMPTY_SHA256 = Digest::SHA256.hexdigest('')

    Credentials = Struct.new(:access_key_id, :secret_access_key, :session_token, :expiration, keyword_init: true)

    def initialize(bucket:, region:, public: false, upload: {}, **)
      @bucket = bucket
      @region = region
      @public = public
      @upload_options = upload || {}
    end

    def upload(key, io, checksum: nil, filename: nil, content_type: nil, disposition: nil, custom_metadata: {}, **)
      instrument :upload, key: key, checksum: checksum do
        body = io.read
        io.rewind if io.respond_to?(:rewind)

        headers = {
          'Content-Length' => body.bytesize.to_s,
          'Content-MD5' => checksum,
          'Content-Type' => content_type,
          'Content-Disposition' => content_disposition_for(filename, disposition)
        }.compact.merge(custom_metadata_headers(custom_metadata))

        request(:put, object_uri(key), body: body, headers: headers)
      rescue Error => error
        raise ActiveStorage::IntegrityError if error.bad_digest?

        raise
      end
    end

    def download(key)
      if block_given?
        instrument :streaming_download, key: key do
          stream(key) { |chunk| yield chunk }
        end
      else
        instrument :download, key: key do
          request(:get, object_uri(key)).body.force_encoding(Encoding::BINARY)
        end
      end
    rescue Error => error
      raise ActiveStorage::FileNotFoundError if error.not_found?

      raise
    end

    def download_chunk(key, range)
      instrument :download_chunk, key: key, range: range do
        range_end = range.exclude_end? ? range.end - 1 : range.end
        response = request(:get, object_uri(key), headers: { 'Range' => "bytes=#{range.begin}-#{range_end}" })
        response.body.force_encoding(Encoding::BINARY)
      end
    rescue Error => error
      raise ActiveStorage::FileNotFoundError if error.not_found?

      raise
    end

    def compose(source_keys, destination_key, filename: nil, content_type: nil, disposition: nil, custom_metadata: {})
      Tempfile.create(binmode: true) do |file|
        source_keys.each do |source_key|
          stream(source_key) { |chunk| file.write(chunk) }
        end
        file.rewind
        upload(
          destination_key,
          file,
          filename: filename,
          content_type: content_type,
          disposition: disposition,
          custom_metadata: custom_metadata
        )
      end
    end

    def delete(key)
      instrument :delete, key: key do
        request(:delete, object_uri(key))
      end
    end

    def delete_prefixed(prefix)
      instrument :delete_prefixed, prefix: prefix do
        list_keys(prefix).each { |key| delete(key) }
      end
    end

    def exist?(key)
      instrument :exist, key: key do |payload|
        exists = request(:head, object_uri(key)).is_a?(Net::HTTPSuccess)
        payload[:exist] = exists
        exists
      rescue Error => error
        raise unless error.not_found?

        payload[:exist] = false
        false
      end
    end

    def url_for_direct_upload(key, expires_in:, content_type:, content_length:, checksum:, custom_metadata: {})
      instrument :url, key: key do |payload|
        headers = {
          'Content-MD5' => checksum,
          'Content-Type' => content_type
        }.merge(custom_metadata_headers(custom_metadata))

        payload[:url] = presigned_url(:put, object_uri(key), expires_in: expires_in, headers: headers)
      end
    end

    def headers_for_direct_upload(key, filename:, content_type:, content_length:, checksum:, custom_metadata: {}, disposition: nil, **)
      {
        'Content-Type' => content_type,
        'Content-MD5' => checksum,
        'Content-Disposition' => content_disposition_for(filename, disposition)
      }.compact.merge(custom_metadata_headers(custom_metadata))
    end

    private

    class Error < StandardError
      attr_reader :response

      def initialize(response)
        @response = response
        super("S3 REST request failed: #{response.code} #{response.message}")
      end

      def not_found?
        response.code.to_i == 404
      end

      def bad_digest?
        response.code.to_i == 400 && response.body.to_s.include?('BadDigest')
      end
    end

    def private_url(key, expires_in:, filename:, disposition:, content_type:, **)
      query = {
        'response-content-disposition' => content_disposition_with(
          type: disposition,
          filename: filename
        ),
        'response-content-type' => content_type
      }.compact

      presigned_url(:get, object_uri(key), expires_in: expires_in, query: query)
    end

    def public_url(key, **)
      object_uri(key).to_s
    end

    def custom_metadata_headers(metadata)
      metadata.transform_keys { |key| "x-amz-meta-#{key}" }
    end

    def content_disposition_for(filename, disposition)
      return unless filename

      content_disposition_with(type: disposition, filename: filename)
    end

    def stream(key)
      offset = 0

      loop do
        response = request(:get, object_uri(key), headers: { 'Range' => "bytes=#{offset}-#{offset + CHUNK_SIZE - 1}" })
        body = response.body.force_encoding(Encoding::BINARY)
        yield body

        break unless response.is_a?(Net::HTTPPartialContent)
        break if body.bytesize < CHUNK_SIZE

        offset += CHUNK_SIZE
      end
    rescue Error => error
      raise ActiveStorage::FileNotFoundError if error.not_found?

      raise
    end

    def list_keys(prefix)
      keys = []
      continuation_token = nil

      loop do
        query = {
          'list-type' => '2',
          'prefix' => prefix,
          'continuation-token' => continuation_token
        }.compact
        response = request(:get, bucket_uri(query: query))

        keys.concat(response.body.scan(%r{<Key>(.*?)</Key>}m).flatten.map { |key| CGI.unescapeHTML(key) })
        continuation_token = response.body[%r{<NextContinuationToken>(.*?)</NextContinuationToken>}m, 1]
        continuation_token = CGI.unescapeHTML(continuation_token) if continuation_token
        break if continuation_token.nil? || continuation_token.empty?
      end

      keys
    end

    def request(method, uri, body: nil, headers: {})
      uri = URI(uri.to_s)
      request = request_class(method).new(uri)
      request['Host'] = uri.host
      headers.each { |key, value| request[key] = value if value }
      request.body = body if body

      sign_request!(request, uri, body || '')

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
        http.request(request)
      end

      raise Error, response unless response.is_a?(Net::HTTPSuccess)

      response
    end

    def request_class(method)
      {
        delete: Net::HTTP::Delete,
        get: Net::HTTP::Get,
        head: Net::HTTP::Head,
        put: Net::HTTP::Put
      }.fetch(method)
    end

    def sign_request!(request, uri, body)
      now = Time.now.utc
      payload_hash = Digest::SHA256.hexdigest(body)
      request['x-amz-content-sha256'] = payload_hash
      request['x-amz-date'] = amz_date(now)
      request['x-amz-security-token'] = credentials.session_token if credentials.session_token

      canonical = canonical_request(
        request.method,
        uri.path,
        uri.query,
        canonical_headers(request),
        signed_headers(request),
        payload_hash
      )

      request['Authorization'] = authorization_header(canonical, now, signed_headers(request))
    end

    def presigned_url(method, uri, expires_in:, headers: {}, query: {})
      now = Time.now.utc
      uri = URI(uri.to_s)
      request_headers = { 'host' => uri.host }.merge(normalized_headers(headers))
      signed_headers = request_headers.keys.sort.join(';')

      query = query.compact.merge(
        'X-Amz-Algorithm' => 'AWS4-HMAC-SHA256',
        'X-Amz-Credential' => credential_scope(now, include_access_key: true),
        'X-Amz-Date' => amz_date(now),
        'X-Amz-Expires' => expires_in.to_i.to_s,
        'X-Amz-Security-Token' => credentials.session_token,
        'X-Amz-SignedHeaders' => signed_headers
      ).compact

      canonical_query = canonical_query_string(query)
      canonical = canonical_request(
        method.to_s.upcase,
        uri.path,
        canonical_query,
        request_headers.map { |key, value| "#{key}:#{value}" }.sort.join("\n") + "\n",
        signed_headers,
        'UNSIGNED-PAYLOAD'
      )

      signature = signature_for(canonical, now)
      uri.query = [canonical_query, "X-Amz-Signature=#{signature}"].reject(&:empty?).join('&')
      uri.to_s
    end

    def authorization_header(canonical_request, time, signed_headers)
      "AWS4-HMAC-SHA256 Credential=#{credential_scope(time, include_access_key: true)}, " \
        "SignedHeaders=#{signed_headers}, Signature=#{signature_for(canonical_request, time)}"
    end

    def signature_for(canonical_request, time)
      OpenSSL::HMAC.hexdigest(
        'sha256',
        signing_key(date_stamp(time)),
        string_to_sign(canonical_request, time)
      )
    end

    def string_to_sign(canonical_request, time)
      [
        'AWS4-HMAC-SHA256',
        amz_date(time),
        credential_scope(time),
        Digest::SHA256.hexdigest(canonical_request)
      ].join("\n")
    end

    def signing_key(date)
      k_date = hmac("AWS4#{credentials.secret_access_key}", date)
      k_region = hmac(k_date, @region)
      k_service = hmac(k_region, 's3')
      hmac(k_service, 'aws4_request')
    end

    def hmac(key, value)
      OpenSSL::HMAC.digest('sha256', key, value)
    end

    def canonical_request(method, path, query, headers, signed_headers, payload_hash)
      [
        method,
        path.presence || '/',
        query.to_s,
        headers,
        signed_headers,
        payload_hash
      ].join("\n")
    end

    def canonical_headers(request)
      normalized_headers(request.each_header.to_h)
        .map { |key, value| "#{key}:#{value}" }
        .sort
        .join("\n") + "\n"
    end

    def signed_headers(request)
      normalized_headers(request.each_header.to_h).keys.sort.join(';')
    end

    def normalized_headers(headers)
      headers.each_with_object({}) do |(key, value), result|
        result[key.to_s.downcase] = value.to_s.strip.gsub(/\s+/, ' ') if value
      end
    end

    def canonical_query_string(query)
      query
        .flat_map { |key, value| Array(value).map { |item| [escape(key), escape(item)] } }
        .sort
        .map { |key, value| "#{key}=#{value}" }
        .join('&')
    end

    def credential_scope(time, include_access_key: false)
      scope = "#{date_stamp(time)}/#{@region}/s3/aws4_request"
      include_access_key ? "#{credentials.access_key_id}/#{scope}" : scope
    end

    def object_uri(key)
      URI("https://#{@bucket}.s3.#{@region}.amazonaws.com/#{encode_key(key)}")
    end

    def bucket_uri(query: {})
      uri = URI("https://#{@bucket}.s3.#{@region}.amazonaws.com/")
      uri.query = canonical_query_string(query) if query.present?
      uri
    end

    def encode_key(key)
      key.to_s.split('/').map { |segment| escape(segment) }.join('/')
    end

    def escape(value)
      CGI.escape(value.to_s).gsub('+', '%20').gsub('%7E', '~')
    end

    def amz_date(time)
      time.strftime('%Y%m%dT%H%M%SZ')
    end

    def date_stamp(time)
      time.strftime('%Y%m%d')
    end

    def credentials
      @credentials = nil if @credentials&.expiration && @credentials.expiration <= Time.now.utc + 300
      @credentials ||= credentials_from_env || credentials_from_container || raise_missing_credentials
    end

    def credentials_from_env
      return unless ENV['AWS_ACCESS_KEY_ID'].present? && ENV['AWS_SECRET_ACCESS_KEY'].present?

      Credentials.new(
        access_key_id: ENV.fetch('AWS_ACCESS_KEY_ID'),
        secret_access_key: ENV.fetch('AWS_SECRET_ACCESS_KEY'),
        session_token: ENV['AWS_SESSION_TOKEN']
      )
    end

    def credentials_from_container
      uri = container_credentials_uri
      return unless uri

      request = Net::HTTP::Get.new(uri)
      if (token = container_authorization_token)
        request['Authorization'] = token
      end

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
        http.request(request)
      end
      return unless response.is_a?(Net::HTTPSuccess)

      data = JSON.parse(response.body)
      Credentials.new(
        access_key_id: data.fetch('AccessKeyId'),
        secret_access_key: data.fetch('SecretAccessKey'),
        session_token: data['Token'],
        expiration: Time.iso8601(data.fetch('Expiration'))
      )
    rescue JSON::ParserError, KeyError
      nil
    end

    def container_credentials_uri
      if ENV['AWS_CONTAINER_CREDENTIALS_RELATIVE_URI'].present?
        URI("http://169.254.170.2#{ENV.fetch('AWS_CONTAINER_CREDENTIALS_RELATIVE_URI')}")
      elsif ENV['AWS_CONTAINER_CREDENTIALS_FULL_URI'].present?
        uri = URI(ENV.fetch('AWS_CONTAINER_CREDENTIALS_FULL_URI'))
        return unless %w[169.254.170.2 169.254.169.254 localhost 127.0.0.1].include?(uri.host)

        uri
      end
    end

    def container_authorization_token
      return ENV['AWS_CONTAINER_AUTHORIZATION_TOKEN'] if ENV['AWS_CONTAINER_AUTHORIZATION_TOKEN'].present?
      return unless ENV['AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE'].present?

      File.read(ENV.fetch('AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE')).strip
    end

    def raise_missing_credentials
      raise ArgumentError, 'Missing AWS credentials for S3 REST Active Storage service'
    end
  end
end
