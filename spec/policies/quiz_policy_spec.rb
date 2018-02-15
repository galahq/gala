# frozen_string_literal: true

require 'rails_helper'

RSpec.describe QuizPolicy do
  let(:reader) { create :reader }

  let(:quiz_reader_must_submit_twice) do
    kase = create :case
    group = create :group
    reader.groups << group
    deployment = create(:deployment, :with_pretest, case: kase, group: group)
    deployment.quiz
  end

  subject { described_class }

  permissions :show? do
    it 'does not allow a reader to see the answers to an arbitrary quiz' do
      expect(subject).not_to permit reader, create(:quiz)
    end

    it 'does not allow a reader to see the answers to a quiz she has not ' \
       'submitted any answers to' do
      expect(subject).not_to permit reader, quiz_reader_must_submit_twice
    end

    it 'does not allow a reader to see the answers to a quiz she has not ' \
       'submitted enough answers to' do
      quiz_reader_must_submit_twice.submissions.create reader: reader
      expect(subject).not_to permit reader, quiz_reader_must_submit_twice
    end

    it 'allows a reader to see a quiz after she has submitted her answers' do
      quiz_reader_must_submit_twice.submissions.create reader: reader
      quiz_reader_must_submit_twice.submissions.create reader: reader
      expect(subject).to permit reader, quiz_reader_must_submit_twice
    end
  end
end
