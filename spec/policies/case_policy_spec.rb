# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CasePolicy do
  let(:anon) { AnonymousUser.new }
  let(:reader) { build :reader }
  let(:editor) { build :reader, :editor }

  let(:unpublished_case) { build :case }
  let(:published_case) { build :case, :published }

  subject { described_class }

  # permissions ".scope" do
  #   pending "add some examples to (or delete) #{__FILE__}"
  # end

  permissions :show? do
    it 'grants an anonymous user access to a published case' do
      expect(subject).to permit anon, published_case
    end

    it 'denies an anonymous user access to an unpublished case' do
      expect(subject).not_to permit anon, unpublished_case
    end

    it 'grants a known user access to a published case' do
      expect(subject).to permit reader, published_case
    end

    it 'denies a known user access to an unpublished case' do
      expect(subject).not_to permit reader, unpublished_case
    end

    it 'grants a known user access to an unpublished case she is enrolled in' do
      reader.enrollments.build case: unpublished_case
      expect(subject).to permit reader, unpublished_case
    end

    it 'grants an editor access to any case' do
      expect(subject).to permit editor, published_case
      expect(subject).to permit editor, unpublished_case
    end
  end

  permissions :create? do
    it 'denies a normal user' do
      expect(subject).not_to permit anon, Case
      expect(subject).not_to permit reader, Case
    end

    it 'allows an editor' do
      expect(subject).to permit editor, Case
    end
  end

  permissions :update? do
    it 'denies a normal user' do
      expect(subject).not_to permit anon, published_case
      expect(subject).not_to permit reader, published_case
    end

    it 'allows an editor' do
      expect(subject).to permit editor, published_case
    end
  end

  permissions :destroy? do
    it 'denies a normal user' do
      expect(subject).not_to permit anon, published_case
      expect(subject).not_to permit reader, published_case
    end

    it 'denies an editor access to delete a published case' do
      expect(subject).not_to permit editor, published_case
    end

    it 'allows an editor to delete an unpublished case' do
      expect(subject).to permit editor, unpublished_case
    end
  end
end
