# frozen_string_literal: true

require 'rails_helper'

# Tier 2 full erasure. What it removes and what it keeps follows the Tier 2
# erasure checklist (O3–O7), so a change to either should be a conscious edit
# of both the service and this spec.
RSpec.describe Readers::EraseAccount do
  subject(:reader) { create :reader, name: 'Real Name', locale: 'fr', persona: 'learner' }

  let(:admin) { create :reader, :editor }
  let(:other) { create :reader }
  let(:closed_on) { Time.zone.parse('2026-11-02 10:00:00') }
  let(:now) { closed_on + 3.days }

  def erase(at: now, by: admin)
    described_class.call(reader, erased_by: by, now: at)
  end

  def gone?(record)
    !record.class.unscoped.exists?(record.id)
  end

  context 'with an account that is not closed' do
    it 'refuses and changes nothing' do
      comment = create :comment, reader: reader

      expect { erase }.to raise_error(described_class::NotClosed)
      expect(comment.reload).to be_persisted
      expect(reader.reload).not_to be_anonymized
    end

    it 'refuses once the account has been restored' do
      Readers::CloseAccount.call(reader, now: closed_on)
      Readers::RestoreAccount.call(reader, now: closed_on + 1.day)

      expect { erase }.to raise_error(described_class::NotClosed)
    end
  end

  context 'with a closed account inside the 30 days' do
    before { Readers::CloseAccount.call(reader, now: closed_on) }

    it 'scrubs the account now instead of at day 30' do
      erase

      expect(reader.reload).to be_anonymized
      expect(reader.anonymized_at).to eq now
      expect(reader.read_attribute(:name)).to eq 'Deleted user'
      expect(reader.email).to end_with '@deleted.invalid'
    end

    it 'records the erasure on the request, which the sweep then leaves alone' do
      erase

      request = reader.account_deletion_requests.sole
      expect(request.erased_at).to eq now
      expect(request.erased_by).to eq admin
      expect(request.completed_at).to eq now
      expect(AccountDeletionRequest.due(closed_on + 31.days)).not_to include request
    end

    it 'clears the account details the day-30 scrub leaves behind' do
      reader.update_columns(sign_in_count: 12, current_sign_in_at: closed_on, last_sign_in_at: closed_on,
                            confirmed_at: closed_on, seen_announcements_created_before: closed_on,
                            terms_of_service: 3, created_password: false)

      erase
      reader.reload

      expect(reader.sign_in_count).to eq 0
      expect(reader.current_sign_in_at).to be_nil
      expect(reader.last_sign_in_at).to be_nil
      expect(reader.confirmed_at).to be_nil
      expect(reader.persona).to be_nil
      expect(reader.locale).to be_nil
      expect(reader.seen_announcements_created_before).to be_nil
      expect(reader.terms_of_service).to eq 0
      expect(reader.created_password).to be true
    end

    it 'keeps the account row' do
      erase

      expect(Reader.exists?(reader.id)).to be true
    end
  end

  describe 'comments' do
    before { Readers::CloseAccount.call(reader, now: closed_on) }

    it 'deletes a reply in someone else\'s thread and leaves the thread' do
      thread = create :comment_thread, reader: other
      opening = create :comment, comment_thread: thread, reader: other
      reply = create :comment, comment_thread: thread, reader: reader

      erase

      expect(gone?(reply)).to be true
      expect(opening.reload).to be_persisted
      expect(thread.reload.comments_count).to eq 1
    end

    it 'blanks the opening comment of a thread others replied to, keeping the replies' do
      thread = create :comment_thread, reader: reader
      opening = create :comment, comment_thread: thread, reader: reader, content: 'I am Real Name from Ohio'
      reply = create :comment, comment_thread: thread, reader: other

      erase

      expect(opening.reload.content).to eq 'This comment was erased at its author’s request.'
      expect(opening.read_attribute(:content).to_s).not_to include 'Ohio'
      expect(reply.reload).to be_persisted
      expect(thread.reload).to be_persisted
    end

    it 'blanks the text in every language it was stored in' do
      thread = create :comment_thread, reader: reader
      opening = create :comment, comment_thread: thread, reader: reader
      Mobility.with_locale(:fr) { opening.update!(content: 'Je suis Real Name') }
      create :comment, comment_thread: thread, reader: other

      erase

      expect(opening.reload.read_attribute(:content).values.join).not_to include 'Real Name'
      expect(opening.read_attribute(:content).keys).to contain_exactly('en', 'fr')
    end

    it 'counts a reply whose author was already removed as someone else\'s' do
      thread = create :comment_thread, reader: reader
      opening = create :comment, comment_thread: thread, reader: reader
      orphan = create :comment, comment_thread: thread, reader: other
      orphan.update_columns(reader_id: nil)

      erase

      expect(opening.reload).to be_persisted
      expect(orphan.reload).to be_persisted
    end

    it 'removes a thread the person started when only they took part' do
      thread = create :comment_thread, reader: reader
      opening = create :comment, comment_thread: thread, reader: reader
      own_reply = create :comment, comment_thread: thread, reader: reader

      erase

      expect(gone?(opening)).to be true
      expect(gone?(own_reply)).to be true
      expect(gone?(thread)).to be true
    end

    it 'removes their empty threads' do
      thread = create :comment_thread, reader: reader

      erase

      expect(gone?(thread)).to be true
    end

    it 'removes the files on a deleted comment and on a blanked opening comment' do
      thread = create :comment_thread, reader: reader
      opening = create :comment, comment_thread: thread, reader: reader
      opening.attachments.attach(io: StringIO.new('photo'), filename: 'me.jpg', content_type: 'image/jpeg')
      create :comment, comment_thread: thread, reader: other
      reply = create :comment, reader: reader
      reply.attachments.attach(io: StringIO.new('scan'), filename: 'id.pdf', content_type: 'application/pdf')
      blob_ids = [opening, reply].flat_map { |comment| comment.attachments.map(&:blob_id) }

      erase

      expect(ActiveStorage::Attachment.where(record_type: 'Comment', record_id: [opening.id, reply.id])).to be_empty
      expect(ActiveStorage::Blob.where(id: blob_ids)).to be_empty
    end

    # The forum lists threads by updated_at, so a touch would lift every
    # thread the person posted in to the top of "most recent".
    it 'touches nothing: threads, forums, cards and pages keep their timestamps' do
      long_ago = Time.zone.parse('2025-01-01 00:00:00')
      page = create :page
      card = create :card, element: page
      replied = create :comment_thread, reader: other
      create :comment, comment_thread: replied, reader: other
      create :comment, comment_thread: replied, reader: reader
      opened = create :comment_thread, reader: reader, forum: replied.forum
      opening = create :comment, comment_thread: opened, reader: reader
      create :comment, comment_thread: opened, reader: other
      # Attached after the comments: a card thread's broadcast needs highlight
      # text the factory doesn't set. The touch chain is the same either way.
      replied.update_columns(card_id: card.id)
      [replied, opened, replied.forum, card, page, opening].each do |record|
        record.update_columns(updated_at: long_ago)
      end

      erase

      expect([replied, opened, replied.forum, card, page].map { |record| record.reload.updated_at })
        .to all(eq long_ago)
      expect(opening.reload.updated_at).to eq long_ago
      expect(opening).not_to be_edited
    end

    it 'removes notifications that point at a deleted comment' do
      reply = create :comment, comment_thread: create(:comment_thread, reader: other), reader: reader
      notification = ReplyNotification.create!(reader: other, notifier: other, comment: reply,
                                               comment_thread: reply.comment_thread,
                                               case: reply.comment_thread.forum.case)

      erase

      expect(gone?(notification)).to be true
    end
  end

  describe 'quiz answers' do
    before { Readers::CloseAccount.call(reader, now: closed_on) }

    it 'deletes their answers and submissions, and nobody else\'s' do
      submission = create :submission, reader: reader
      answer = create :answer, reader: reader, submission: submission, quiz: submission.quiz
      others_submission = create :submission, reader: other, quiz: submission.quiz
      others_answer = create :answer, reader: other, submission: others_submission, quiz: submission.quiz

      erase

      expect(gone?(answer)).to be true
      expect(gone?(submission)).to be true
      expect(others_answer.reload).to be_persisted
      expect(others_submission.reload).to be_persisted
    end

    it 'deletes them even when the B1 switch keeps them on closure' do
      answer = create :answer, reader: reader

      described_class.call(reader, erased_by: admin, now: now)

      expect(gone?(answer)).to be true
    end
  end

  describe 'reading lists' do
    let!(:own_list) { create :reading_list, reader: reader }
    let!(:own_item) { create :reading_list_item, reading_list: own_list }
    let!(:shared_list) do
      create :reading_list, reader: reader, title: 'Real Name’s picks', description: 'For my class at Ohio'
    end
    let!(:shared_item) { create :reading_list_item, reading_list: shared_list, notes: 'I taught this in 2024' }
    let!(:others_save) { create :reading_list_save, reading_list: shared_list, reader: other }

    before do
      Readers::CloseAccount.call(reader, now: closed_on)
      erase
    end

    it 'deletes a list nobody else saved' do
      expect(gone?(own_list)).to be true
      expect(gone?(own_item)).to be true
    end

    it 'keeps a list others saved, with its cases, but erases what the person wrote' do
      shared_list.reload

      expect(shared_list.title).to eq 'Reading list'
      expect(shared_list.description).to eq ''
      expect(shared_item.reload.notes).to eq ''
      expect(shared_item.case).to be_present
      expect(others_save.reload).to be_persisted
    end

    it 'does not put the kept list back in the erased account\'s library' do
      expect(ReadingListSave.where(reader_id: reader.id)).to be_empty
    end
  end

  describe 'visits and events' do
    let!(:visit) { create :visit, user: reader }
    let!(:event) { create :ahoy_event, user: reader, visit: visit }
    let!(:before_sign_in) { create :ahoy_event, user: nil, visit: visit }
    let!(:shared_computer) { create :ahoy_event, user: other, visit: visit }
    let!(:others_visit) { create :visit, user: other }

    before do
      Readers::CloseAccount.call(reader, now: closed_on)
      erase
    end

    it 'deletes their visits, their events, and the anonymous events on their visits' do
      expect(gone?(visit)).to be true
      expect(gone?(event)).to be true
      expect(gone?(before_sign_in)).to be true
    end

    it 'keeps another person\'s activity' do
      expect(shared_computer.reload).to be_persisted
      expect(others_visit.reload).to be_persisted
    end
  end

  describe 'what it keeps' do
    before { Readers::CloseAccount.call(reader, now: closed_on) }

    it 'keeps the quizzes they wrote private on the row' do
      quiz = create :quiz, author: reader

      erase

      expect(quiz.reload.author_id).to eq reader.id
      expect(quiz.case.quizzes.suggested).not_to include quiz
    end
  end

  context 'after day 30' do
    before do
      Readers::CloseAccount.call(reader, now: closed_on)
      Readers::AnonymizeAccount.call(reader, now: closed_on + 30.days)
    end

    it 'still erases by reader id, without scrubbing again' do
      comment = create :comment, reader: reader

      erase(at: closed_on + 40.days)

      expect(gone?(comment)).to be true
      expect(reader.reload.anonymized_at).to eq closed_on + 30.days
      expect(reader.account_deletion_requests.sole.erased_at).to eq closed_on + 40.days
    end
  end

  context 'when run twice' do
    before { Readers::CloseAccount.call(reader, now: closed_on) }

    it 'finishes cleanly and keeps the first run\'s record' do
      create :comment, reader: reader
      erase
      later_admin = create :reader, :editor
      comment = create :comment, reader: reader

      expect { erase(at: now + 1.day, by: later_admin) }.not_to raise_error
      expect(gone?(comment)).to be true

      request = reader.account_deletion_requests.sole
      expect(request.erased_at).to eq now
      expect(request.erased_by).to eq admin
      expect(request.erasure_counts['comments_deleted']).to eq 1
    end
  end
end
