# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ForumPolicy, type: :policy do
  subject { described_class }

  describe 'Scope' do
    it 'includes the forums the reader can participate in' do
      reader = create :reader
      kase = create :case
      global_forum = kase.forums.merge(GlobalCommunity.instance.forums).first

      create :enrollment, case: kase, reader: reader

      my_group = create :group, name: 'My Group'
      create :group_membership, :admin, group: my_group, reader: reader

      create :deployment, group: my_group, case: kase
      my_forum = kase.forums.merge(my_group.community.forums).first

      scope = ForumPolicy::Scope.new(reader, Forum).resolve

      expect(scope).to include global_forum, my_forum
    end
  end

  permissions :moderate? do
    it 'denies a normal reader from moderating forums' do
      reader = build :reader
      forum = build :forum
      expect(subject).not_to permit reader, forum
    end

    it 'permits case authors to moderate the global community forum ' \
       'for their case' do
      kase = create :case

      author = build :reader
      kase.editorships.create editor: author

      forum = build :forum, case: kase

      expect(subject).to permit author, forum
    end

    it 'denies case authors from moderating non-global forums ' \
       'on their case' do
      kase = create :case

      author = build :reader
      kase.editorships.create editor: author

      forum = build :forum, :with_community, case: kase

      expect(subject).not_to permit author, forum
    end

    it 'denies case authors from moderating the global community forum ' \
       'on someone else’s case' do
      kase = create :case

      author = build :reader
      kase.editorships.create editor: author

      author2 = build :reader
      kase2 = create :case
      kase2.editorships.create editor: author2

      forum = build :forum, case: kase2

      expect(subject).not_to permit author, forum
    end

    it 'permits group admins to moderate their community’s forums' do
      admin = build :reader
      group = build :group
      create :group_membership, :admin, group: group, reader: admin

      kase = build :case
      community = build :community, group: group
      forum = build :forum, case: kase, community: community

      expect(subject).to permit admin, forum
    end

    it 'denies group admins from moderating other forums' do
      admin = build :reader
      group = build :group
      create :group_membership, :admin, group: group, reader: admin

      kase = build :case
      forum = build :forum, case: kase

        expect(subject).not_to permit admin, forum
    end

    it 'allows editors to moderate any forum' do
      editor = build :reader, :editor
      forum = build :forum
      expect(subject).to permit editor, forum
    end
  end
end
