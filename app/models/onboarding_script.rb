# frozen_string_literal: true

# Specifies what to do to onboard a user who has not chosen a particular persona
class OnboardingScript
  def self.for(reader)
    case reader.persona
    when 'learner'
      LearnerOnboardingScript.new(reader)
    when 'teacher'
      TeacherOnboardingScript.new(reader)
    when 'writer'
      WriterOnboardingScript.new(reader)
    else
      new(reader)
    end
  end

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

# Specifies what to do to onboard a reader who wants to learn with cases
class LearnerOnboardingScript < OnboardingScript
  def self.all_spotlights
    super + [
      'catalog_search',     # search box on the catalog page
      'catalog_categories', # natural resources header
      'comment',            # respond button on a card
      'community_chooser',  # when enrolled, if there’s more than one community
      'conversation_view'   # over conversation button
    ]
  end
end

# Specifies what to do to onboard a reader who wants to teach with cases
class TeacherOnboardingScript < OnboardingScript
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

# Specifies what to do to onboard a reader who wants to write their own cases
class WriterOnboardingScript < OnboardingScript
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
