# frozen_string_literal: true

class Reader
  # A reader is onboarded by showing spotlights on features relevant to the
  # persona they choose when creating an account.
  module Onboarding
    extend ActiveSupport::Concern

    included do
      has_many :spotlight_acknowledgements, dependent: :destroy
    end

    def acknowledged_spotlights
      spotlight_acknowledgements.pluck(:spotlight_key)
    end

    def onboarding_script
      OnboardingScript.for(self)
    end

    def unacknowledged_spotlights
      onboarding_script.spotlights
    end
  end
end
