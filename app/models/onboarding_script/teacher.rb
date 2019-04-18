# frozen_string_literal: true

module OnboardingScript
  # Specifies what to do to onboard a reader who wants to teach with cases
  class Teacher < Base
    def self.all_spotlights
      super + [
        'catalog_search',     # see above
        'catalog_categories', # see above
        'caselog',            # over conversation button
        'deploy',             # toolbar button
        'invite_learners',    # on the deployments page
        'add_quiz',           # on the deployments page
        'deployment_details'  # on the deployments page, over N enrolled
      ]
    end
  end
end
