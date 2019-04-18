# frozen_string_literal: true

# Namespace and factory for configuration objects that define what a onboarding
# a particular reader needs given their chosen persona
module OnboardingScript
  def self.for(reader)
    case reader.persona
    when 'learner'
      Learner.new(reader)
    when 'teacher'
      Teacher.new(reader)
    when 'writer'
      Writer.new(reader)
    else
      Base.new(reader)
    end
  end
end
