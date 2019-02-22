# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OnboardingScript do
  describe '::for' do
    it 'returns the right subclass based on the given reader' do
      reader = build :reader, persona: nil
      expect(OnboardingScript.for(reader))
        .to be_an_instance_of OnboardingScript

      reader.persona = :learner
      expect(OnboardingScript.for(reader))
        .to be_a LearnerOnboardingScript

      reader.persona = :teacher
      expect(OnboardingScript.for(reader))
        .to be_a TeacherOnboardingScript

      reader.persona = :writer
      expect(OnboardingScript.for(reader))
        .to be_a WriterOnboardingScript
    end
  end
end

RSpec.shared_examples 'an OnboardingScript' do
  describe '#spotlights' do
    it 'includes spotlights the user has not acknowledged' do
      expect(described_class.all_spotlights).to include('test_dummy')

      reader = create :reader

      script = described_class.new(reader)
      expect(script.spotlights).to include('test_dummy')
    end

    it 'doesn’t include any spotlights the user has already acknowledged' do
      expect(described_class.all_spotlights).to include('test_dummy')

      reader = create :reader
      create :spotlight_acknowledgement,
             reader: reader, spotlight_key: 'test_dummy'

      script = described_class.new(reader)
      expect(script.spotlights).not_to include('test_dummy')
      expect(script.spotlights).not_to be_blank
    end
  end
end

[
  LearnerOnboardingScript,
  TeacherOnboardingScript,
  WriterOnboardingScript
].each do |klass|
  RSpec.describe klass do
    it_behaves_like 'an OnboardingScript'
  end
end
