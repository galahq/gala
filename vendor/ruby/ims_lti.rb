# frozen_string_literal: true

require 'base64'
require 'cgi'
require 'openssl'
require 'securerandom'
require 'uri'

module IMS
  module LTI
    module OAuth
      module_function

      def valid_signature?(request, consumer_key:, shared_secret:)
        params = request.request_parameters.to_h
        return false unless params['oauth_consumer_key'] == consumer_key
        return false unless params['oauth_signature_method'] == 'HMAC-SHA1'
        return false unless params['oauth_signature'].present?

        expected = signature(
          request.method,
          request.base_url + request.path,
          params.except('oauth_signature'),
          shared_secret
        )

        ActiveSupport::SecurityUtils.secure_compare(
          expected,
          params['oauth_signature']
        )
      rescue StandardError
        false
      end

      def signature(method, url, params, shared_secret)
        key = "#{escape(shared_secret)}&"
        Base64.strict_encode64(
          OpenSSL::HMAC.digest('sha1', key, signature_base(method, url, params))
        )
      end

      def signature_base(method, url, params)
        [
          method.to_s.upcase,
          normalized_url(url),
          normalize_params(params)
        ].map { |part| escape(part) }.join('&')
      end

      def normalize_params(params)
        params.flat_map do |key, value|
          Array(value).map { |item| [escape(key), escape(item)] }
        end.sort.map { |key, value| "#{key}=#{value}" }.join('&')
      end

      def normalized_url(url)
        uri = URI(url.to_s)
        port = uri.port
        default_port = uri.scheme == 'https' ? 443 : 80
        host = uri.host.downcase
        host = "#{host}:#{port}" if port && port != default_port

        "#{uri.scheme.downcase}://#{host}#{uri.path.presence || '/'}"
      end

      def escape(value)
        CGI.escape(value.to_s).gsub('+', '%20').gsub('%7E', '~')
      end
    end

    class ToolProvider
      def initialize(consumer_key, shared_secret, _params = {})
        @consumer_key = consumer_key
        @shared_secret = shared_secret
      end

      def valid_request?(request)
        OAuth.valid_signature?(
          request,
          consumer_key: @consumer_key,
          shared_secret: @shared_secret
        )
      end
    end

    class ToolConfig
      attr_reader :title, :launch_url

      def initialize(title:, launch_url:)
        @title = title
        @launch_url = launch_url
      end
    end

    class ToolConsumer
      attr_accessor :user_id, :resource_link_id, :content_item_return_url

      def initialize(consumer_key, shared_secret)
        @consumer_key = consumer_key
        @shared_secret = shared_secret
      end

      def set_config(config)
        @config = config
      end

      def generate_launch_data
        params = unsigned_launch_data
        params['oauth_signature'] = OAuth.signature(
          'POST',
          @config.launch_url,
          params,
          @shared_secret
        )
        params
      end

      private

      def unsigned_launch_data
        {
          'lti_message_type' => 'basic-lti-launch-request',
          'lti_version' => 'LTI-1p0',
          'oauth_callback' => 'about:blank',
          'oauth_consumer_key' => @consumer_key,
          'oauth_nonce' => SecureRandom.hex(16),
          'oauth_signature_method' => 'HMAC-SHA1',
          'oauth_timestamp' => Time.now.to_i.to_s,
          'oauth_version' => '1.0',
          'resource_link_id' => resource_link_id,
          'content_item_return_url' => content_item_return_url,
          'context_id' => 'test-context',
          'context_title' => 'Test Context',
          'ext_roles' => 'urn:lti:role:ims/lis/Instructor',
          'lis_person_contact_email_primary' => 'lti@example.com',
          'lis_person_name_full' => 'LTI Reader',
          'launch_presentation_locale' => 'en',
          'user_id' => user_id
        }
      end
    end
  end
end

module GalaLti
  module_function

  def auth_hash(params)
    raw_info = params.to_unsafe_h
    OmniAuth::AuthHash.new(
      provider: 'lti',
      uid: raw_info['user_id'],
      info: {
        email: raw_info['lis_person_contact_email_primary'],
        name: raw_info['lis_person_name_full'],
        first_name: raw_info['lis_person_name_given'],
        last_name: raw_info['lis_person_name_family'],
        image: raw_info['user_image']
      },
      credentials: {
        token: raw_info['oauth_consumer_key'],
        secret: ENV['LTI_SECRET']
      },
      extra: {
        raw_info: raw_info
      }
    )
  end
end
