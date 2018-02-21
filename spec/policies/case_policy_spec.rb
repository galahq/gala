# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CasePolicy do
  let(:anon) { AnonymousUser.new }
  let(:reader) { build :reader }
  let(:editor) { build :reader, :editor }

  let(:kase) { build :case }
  let(:published_case) { build :case, :published }

  subject { described_class }

  permissions :show? do
    it 'grants an anonymous user access to a published case' do
      expect(subject).to permit anon, published_case
    end

    it 'denies an anonymous user access to an unpublished case' do
      expect(subject).not_to permit anon, kase
    end

    it 'grants a known user access to a published case' do
      expect(subject).to permit reader, published_case
    end

    it 'denies a known user access to an unpublished case' do
      expect(subject).not_to permit reader, kase
    end

    it 'grants a known user access to an unpublished case she is enrolled in' do
      reader.enrollments.build case: kase
      expect(subject).to permit reader, kase
    end

    it 'grants an editor access to any case' do
      expect(subject).to permit editor, published_case
      expect(subject).to permit editor, kase
    end
  end

  permissions :create? do
    let(:library) { create :library }

    it 'allows a reader to add a case to the Shared Cases library' do
      expect(subject).to permit reader, kase
    end

    it 'does not allow a reader to add a case to an arbitrary library' do
      kase.library = library
      expect(subject).not_to permit reader, kase
    end

    it 'allows a reader to add a case to a library she manages' do
      library.managers << reader
      kase.library = library
      expect(subject).to permit reader, kase
    end

    it 'allows an editor to add a case to an arbitrary library' do
      kase.library = library
      expect(subject).to permit editor, kase
    end
  end

  permissions :update? do
    before do
      reader.save
      published_case.save
    end

    it 'denies a normal user' do
      expect(subject).not_to permit anon, published_case
      expect(subject).not_to permit reader, published_case
    end

    it 'allows a user who has an editorship' do
      published_case.editorships.create editor: reader

      expect(subject).to permit reader, published_case
    end

    it 'allows an editor' do
      expect(subject).to permit editor, published_case
    end
  end

  permissions :destroy? do
    it 'denies a normal user' do
      expect(subject).not_to permit anon, kase
      expect(subject).not_to permit reader, kase
    end

    it 'denies an editor access to delete a published case' do
      expect(subject).not_to permit editor, published_case
    end

    it 'allows an editor to delete an unpublished case' do
      expect(subject).to permit editor, kase
    end
  end
end
