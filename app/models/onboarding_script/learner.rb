# frozen_string_literal: true

module OnboardingScript
  # Specifies what to do to onboard a reader who wants to learn with cases
  class Learner < Base
    def self.all_spotlights
      super + [
        'catalog_search',     # search box on the catalog page
        'catalog_categories', # natural resources header
        'comment',            # respond button on a card
        'community_chooser',  # when enrolled, if more than one community
        'conversation_view'   # over conversation button
      ]
    end
  end
end
