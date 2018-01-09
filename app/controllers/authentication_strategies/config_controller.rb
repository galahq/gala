# frozen_string_literal: true

module AuthenticationStrategies
  # An external LTI Tool Provider is configured in a Tool Consumer with an XML
  # configuration file.
  class ConfigController < ApplicationController
    # @route [GET] `/authorization_strategies/config/lti.xml`
    def lti; end
  end
end
