# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReaderPolicy do
  let(:reader) { create :reader }
  let(:editor) { create :reader, :editor }

  subject { described_class }

  permissions :update? do
    it 'does not allow a reader to update someone else’s profile' do
      expect(subject).not_to permit reader, build(:reader)
    end

    it 'allows a reader to update her own profile' do
      expect(subject).to permit reader, reader
    end

    it 'allows an editor to update anyone’s profile' do
      expect(subject).to permit editor, reader
    end
  end
end
