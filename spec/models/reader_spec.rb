# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reader, type: :model do
  subject { build :reader }

  it do
    should define_enum_for(:persona)
      .with_values(learner: 'learner', teacher: 'teacher', writer: 'writer')
      .backed_by_column_of_type(:string)
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
end
