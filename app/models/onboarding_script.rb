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
    super + %w[catalog_search catalog_keywords comment]
  end
end

# Specifies what to do to onboard a reader who wants to teach with cases
class TeacherOnboardingScript < OnboardingScript
  def self.all_spotlights
    super + %w[catalog_search catalog_keywords caselog deploy add_quiz
               invite_learners]
  end
end

# Specifies what to do to onboard a reader who wants to write their own cases
class WriterOnboardingScript < OnboardingScript
  def self.all_spotlights
    super + %w[my_cases_button publish_button]
  end
end
