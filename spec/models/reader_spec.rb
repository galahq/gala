# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reader, type: :model do
  subject { build :reader }

  it { should have_many(:reading_lists).dependent(:destroy) }
  it { should have_many :spotlight_acknowledgements }

  it do
    should define_enum_for(:persona)
      .with_values(learner: 'learner', teacher: 'teacher', writer: 'writer')
      .backed_by_column_of_type(:string)
  end

  it 'gets access to CaseLog if its persona is teacher' do
    subject.persona = 'teacher'
    subject.save
    expect(subject.communities).to include Community.case_log
  end

  it 'gets access to CaseLog if its persona is writer' do
    subject.persona = 'writer'
    subject.save
    expect(subject.communities).to include Community.case_log
  end

  it 'records that a user chose a password when they set it directly' do
    subject.created_password = false
    subject.save

    subject.password = 'new password'
    subject.save
    expect(subject.created_password).to be true
  end

  it 'has access to the right communities' do
    subject.save

    invited_community = create :community
    create :invitation, reader: subject, community: invited_community

    group = create :group
    subject.groups << group

    expect(subject.communities).to include(invited_community,
                                           group.community)
  end

  describe '#acknowledged_spotlights' do
    it 'lists the spotlight keys that the reader has acknowledgements' do
      reader = create :reader
      create :spotlight_acknowledgement, reader: reader, spotlight_key: 'yep'

      expect(reader.acknowledged_spotlights).to eq(%w[yep])
    end
  end
end
