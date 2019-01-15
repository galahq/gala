# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommentPolicy, type: :policy do
  subject { described_class }

  permissions :destroy? do
    it 'denies a reader from deleting someone else’s comment' do
      reader = build :reader
      comment = build :comment
      expect(subject).not_to permit reader, comment
    end

    it 'permits case authors to delete comments in the global community forum ' \
       'for their case' do
      kase = create :case

      author = build :reader
      kase.editorships.create editor: author

      forum = build :forum, case: kase
      thread = build :comment_thread, forum: forum
      comment = build :comment, comment_thread: thread

      expect(subject).to permit author, comment
    end

    it 'denies case authors from delete comments in non-global forums ' \
       'on their case' do
      kase = create :case

      author = build :reader
      kase.editorships.create editor: author

      forum = build :forum, :with_community, case: kase
      thread = build :comment_thread, forum: forum
      comment = build :comment, comment_thread: thread

      expect(subject).not_to permit author, comment
    end

    it 'denies case authors from delete comments in the global community forum ' \
       'on someone else’s case' do
      kase = create :case

      author = build :reader
      kase.editorships.create editor: author

      author2 = build :reader
      kase2 = create :case
      kase2.editorships.create editor: author2

      forum = build :forum, case: kase2
      thread = build :comment_thread, forum: forum
      comment = build :comment, comment_thread: thread

      expect(subject).not_to permit author, comment
    end

    it 'permits group admins to delete comments in their community’s forums' do
      admin = build :reader
      group = build :group
      create :group_membership, :admin, group: group, reader: admin

      kase = build :case
      community = build :community, group: group
      forum = build :forum, case: kase, community: community
      thread = build :comment_thread, forum: forum
      comment = build :comment, comment_thread: thread

      expect(subject).to permit admin, comment
    end

    it 'denies group admins from deleting comments in other forums' do
      admin = build :reader
      group = build :group
      create :group_membership, :admin, group: group, reader: admin

      kase = build :case
      forum = build :forum, case: kase
      thread = build :comment_thread, forum: forum
      comment = build :comment, comment_thread: thread

      expect(subject).not_to permit admin, comment
    end

    it 'allows editors to delete any comment' do
      editor = build :reader, :editor
      comment = build :comment
      expect(subject).to permit editor, comment
    end
  end
end
