# frozen_string_literal: true

module Orchard
  module Integration
    module TestHelpers
      module LtiLaunch
        def override_environment_variables
          cached_lti_key = ENV['LTI_KEY']
          cached_lti_secret = ENV['LTI_SECRET']
          ENV['LTI_KEY'] = 'test'
          ENV['LTI_SECRET'] = 'secret'
          result = yield
          ENV['LTI_KEY'] = cached_lti_key
          ENV['LTI_SECRET'] = cached_lti_secret
          result
        end

        def valid_lti_params
          consumer = IMS::LTI::ToolConsumer.new ENV['LTI_KEY'], ENV['LTI_SECRET']
          consumer.set_config tool_configuration
          consumer.user_id = SecureRandom.base58
          consumer.resource_link_id = 'consumer_secret'
          consumer.content_item_return_url = 'https://canvas.umich.edu/return_url'
          consumer.generate_launch_data
        end

        def tool_configuration
          IMS::LTI::ToolConfig.new title: 'Gala',
                                   launch_url: catalog_content_items_url
        end
      end
    end
  end
end
