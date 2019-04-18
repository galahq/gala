# frozen_string_literal: true

module OnboardingScript
  # Specifies what to do to onboard a reader who wants to write their own cases
  class Writer < Base
    def self.all_spotlights
      super + [
        'add_collaborators', # toolbar button
        'publish',           # over “options” button, for “when you’re finished”
        'first-caselog',     # see above
        'add_edgenote',      # editor toolbar button
        'add_citation'       # editor toolbar button
      ]
    end
  end
end
