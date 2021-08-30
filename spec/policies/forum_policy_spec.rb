# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ForumPolicy, type: :policy do
  subject { described_class }

  describe 'Scope' do
    it 'includes the forums the reader can participate in' do
      reader = create :reader
      kase = create :case

      create :enrollment, case: kase, reader: reader

      my_group = create :group, name: 'My Group'
      create :group_membership, :admin, group: my_group, reader: reader

      create :deployment, group: my_group, case: kase
      my_forum = kase.forums.merge(my_group.community.forums).first

      scope = ForumPolicy::Scope.new(reader, Forum).resolve

      expect(scope).to include my_forum
    end

    it 'includes no forums if the user is not enrolled in the case' do
      reader = create :reader
      kase = create :case

      my_group = create :group, name: 'My Group'
      create :group_membership, :admin, group: my_group, reader: reader

      create :deployment, group: my_group, case: kase
      my_forum = kase.forums.merge(my_group.community.forums).first

      scope = ForumPolicy::Scope.new(reader, Forum).resolve

      expect(scope).not_to include my_forum
    end
  end

  permissions :show? do
    it 'allows a reader who is enrolled in the case to read the forum of a ' \
       'community they belong to' do
      reader = create :reader
      kase = create :case

      create :enrollment, case: kase, reader: reader

      my_group = create :group, name: 'My Group'
      create :group_membership, :admin, group: my_group, reader: reader

      create :deployment, group: my_group, case: kase
      my_forum = kase.forums.merge(my_group.community.forums).first

      expect(subject).to permit reader, my_forum
    end

    it 'does not allow a reader who is enrolled to read the forum of a '\
       'different community' do
      reader = create :reader
      kase = create :case

      create :enrollment, case: kase, reader: reader

      other_group = create :group, name: 'My Group'
      create :deployment, group: other_group, case: kase
      other_forum = kase.forums.merge(other_group.community.forums).first

      expect(subject).not_to permit reader, other_forum
    end

  end

  permissions :moderate? do
    it 'denies a normal reader from moderating forums' do
      reader = build :reader
      forum = build :forum, :with_community
      expect(subject).not_to permit reader, forum
    end

    it 'denies case authors from moderating non-global forums ' \
       'on their case' do
      kase = create :case

      author = build :reader
      kase.editorships.create editor: author

      forum = build :forum, :with_community, case: kase

      expect(subject).not_to permit author, forum
    end

    it 'denies case authors from moderating' \
       'on someone else’s case' do
      kase = create :case

      author = build :reader
      kase.editorships.create editor: author

      author2 = build :reader
      kase2 = create :case
      kase2.editorships.create editor: author2

      forum = build :forum, :with_community, case: kase2

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
      forum = build :forum, :with_community, case: kase

      expect(subject).not_to permit admin, forum
    end

    it 'allows editors to moderate any forum' do
      editor = build :reader, :editor
      forum = build :forum
      expect(subject).to permit editor, forum
    end
  end
end
