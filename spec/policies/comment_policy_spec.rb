# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommentPolicy, type: :policy do
  subject { described_class }

  permissions :destroy? do
    it 'denies a reader from deleting a comment if they cannot moderate the ' \
       'comment’s forum' do
      reader = build :reader
      comment = build :comment

      forum_policy = instance_double ForumPolicy
      allow(forum_policy).to receive(:moderate?).and_return(false)

      policy = described_class.new(reader, comment, forum_policy)
      expect(policy.destroy?).to be_falsey
    end

    it 'allows a reader to delete a comment if they can moderate the ' \
       'comment’s forum' do
      editor = build :reader, :editor
      comment = build :comment

      forum_policy = instance_double ForumPolicy
      allow(forum_policy).to receive(:moderate?).and_return(true)

      policy = described_class.new(editor, comment, forum_policy)
      expect(policy.destroy?).to be_truthy
    end
  end
end