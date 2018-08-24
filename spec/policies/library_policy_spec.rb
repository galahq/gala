# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LibraryPolicy do
  let(:reader) { create :reader }
  let(:editor) { create :reader, :editor }

  let(:library) { create :library }

  subject { described_class }

  permissions 'AdminScope' do
    it 'includes only the libraries a reader manages' do
      managed_library = reader.libraries.create attributes_for :library
      scope = LibraryPolicy::AdminScope.new(reader, Library).resolve

      expect(scope).not_to include library
      expect(scope).to include managed_library
    end

    it 'includes all libraries for an editor' do
      managed_library = editor.libraries.create attributes_for :library
      scope = LibraryPolicy::AdminScope.new(editor, Library).resolve

      expect(scope).to include library
      expect(scope).to include managed_library
    end
  end

  permissions 'Scope' do
    it 'includes libraries that have at least one case' do
      create(:case).tap do |c|
        library.cases << c
        library.reload
      end
      scope = Pundit.policy_scope!(editor, Library)
      expect(scope).to include library
    end

    it 'includes the libraries a reader manages' do
      managed_library = reader.libraries.create attributes_for :library
      scope = Pundit.policy_scope!(reader, Library)
      expect(scope).to include managed_library
    end
  end

  permissions :update? do
    it 'does not allow an arbitrary reader to update a library' do
      expect(subject).not_to permit reader, library
    end

    it 'allows a library’s manager to update it' do
      library.managers << reader
      expect(subject).to permit reader, library
    end

    it 'allows an editor to update a library' do
      expect(subject).to permit editor, library
    end
  end
end
