# frozen_string_literal: true

require "spec_helper"

RSpec.describe "Lograge initializer" do
  LogrageConfig = Struct.new(:enabled, :custom_options, :formatter, keyword_init: true)
  AppConfig = Struct.new(:lograge, keyword_init: true)

  describe "formatter" do
    def load_lograge_config
      lograge = LogrageConfig.new
      config = AppConfig.new(lograge:)
      app = Object.new
      env = Object.new

      app.define_singleton_method(:config) { config }
      app.define_singleton_method(:configure) { |&block| instance_eval(&block) }
      env.define_singleton_method(:production?) { true }

      stub_const("Rails", Module.new)
      Rails.define_singleton_method(:application) { app }
      Rails.define_singleton_method(:env) { env }

      load File.expand_path("../../config/initializers/lograge.rb", __dir__)

      lograge
    end

    it "formats Hash-like action-controller event data without awesome_inspect errors" do
      formatter = load_lograge_config.formatter
      formatted = nil

      expect do
        formatted = formatter.call(
          {
            method: "GET",
            path: "/up",
            params: {
              "controller" => "health_check",
              "action" => "show",
            },
          },
        )
      end.not_to raise_error

      expect(formatted).to be_a(String)
      expect(formatted).to include("params")
    end
  end
end
