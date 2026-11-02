# frozen_string_literal: true

require 'rails_helper'

# The confirmation page's counts must be what the erasure then does, or Ed's
# reply to the person would misstate what was erased.
RSpec.describe Readers::ErasureSummary do
  let(:reader) { create :reader }
  let(:other) { create :reader }

  before do
    Readers::CloseAccount.call(reader)

    opened = create :comment_thread, reader: reader
    create :comment, comment_thread: opened, reader: reader
    create :comment, comment_thread: opened, reader: other
    create :comment, reader: reader
    create :comment, reader: reader

    submission = create :submission, reader: reader
    create_list :answer, 2, reader: reader, submission: submission, quiz: submission.quiz

    create :reading_list, reader: reader
    create :reading_list_save, reader: other, reading_list: create(:reading_list, reader: reader)

    visit = create :visit, user: reader
    create :ahoy_event, user: reader, visit: visit
    create :ahoy_event, user: nil, visit: visit
  end

  it 'counts what the erasure will remove' do
    summary = described_class.new(reader)

    expect(summary).to have_attributes(
      comments_deleted: 2, comments_blanked: 1, quiz_answers: 2, quiz_submissions: 1,
      reading_lists_deleted: 1, reading_lists_kept: 1, visits: 1, events: 2
    )
  end

  it 'matches what the erasure actually removes' do
    summary = described_class.new(reader)

    expect { Readers::EraseAccount.call(reader, erased_by: other) }
      .to change(Comment, :count).by(-summary.comments_deleted)
      .and change(Answer, :count).by(-summary.quiz_answers)
      .and change(Submission, :count).by(-summary.quiz_submissions)
      .and change(ReadingList, :count).by(-summary.reading_lists_deleted)
      .and change(Visit, :count).by(-summary.visits)
      .and change(Ahoy::Event, :count).by(-summary.events)
  end
end
