# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EnrollmentPolicy do
  let(:reader) { build :reader }
  let(:editor) { build :reader, :editor }

  let(:enrollment) { build_stubbed :enrollment }

  subject { described_class }

  permissions :create? do
    it 'allows a reader to create her own student enrollment' do
      enrollment.reader = reader
      expect(subject).to permit reader, enrollment
    end

    it 'does not allow a reader to create her own instructor enrollment' do
      enrollment.status = :instructor
      enrollment.reader = reader
      expect(subject).not_to permit reader, enrollment
    end

    it 'does not allow a reader to create another reader’s enrollment' do
      expect(subject).not_to permit reader, enrollment
    end

    it 'allows an editor to create another reader’s enrollment' do
      expect(subject).to permit editor, enrollment
    end

    it 'allows an editor to create an instructor enrollment' do
      enrollment.status = :instructor
      expect(subject).to permit editor, enrollment
    end
  end

  permissions :destroy? do
    it 'allows a reader to delete her own enrollment' do
      enrollment.reader = reader
      expect(subject).to permit reader, enrollment
    end

    it 'does not allow a reader to delete another reader’s enrollment' do
      expect(subject).not_to permit reader, enrollment
    end

    it 'allows an editor to delete another reader’s enrollment' do
      expect(subject).to permit editor, enrollment
    end
  end
end
