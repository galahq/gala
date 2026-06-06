# frozen_string_literal: true

require 'pp'

module LogragePayloadFormatter
  module_function

  def format(data)
    return PP.pp(data, +'') unless data.respond_to?(:awesome_inspect)

    data.awesome_inspect(multiline: !Rails.env.production?)
  end
end
