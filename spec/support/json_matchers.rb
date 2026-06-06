# frozen_string_literal: true

RSpec::Matchers.define :be_json do |expected = nil|
  match do |actual|
    @actual_json = JSON.parse(actual, symbolize_names: true)
    expected.nil? || values_match?(expected, @actual_json)
  rescue JSON::ParserError => e
    @parse_error = e
    false
  end

  failure_message do
    if @parse_error
      "expected valid JSON, but parsing failed: #{@parse_error.message}"
    else
      "expected JSON to match #{expected.inspect}, got #{@actual_json.inspect}"
    end
  end
end
