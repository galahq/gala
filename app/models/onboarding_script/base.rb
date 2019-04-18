# frozen_string_literal: true

module OnboardingScript
  # Specifies what to do to onboard a user who has not chosen a persona
  class Base
    def self.all_spotlights
      return ['test_dummy'] if Rails.env.test?

      []
    end

    attr_reader :reader

    def initialize(reader)
      @reader = reader
    end

    def spotlights
      self.class.all_spotlights - reader.acknowledged_spotlights
    end
  end
end
