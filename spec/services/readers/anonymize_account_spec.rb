# frozen_string_literal: true

require 'rails_helper'

# The Tier 1 scrub. Each association's disposition here is a register
# decision (A2, A11, A12, A16, A22, B1, E1), so a change to any of them should
# be a conscious edit of both the service and this spec.
RSpec.describe Readers::AnonymizeAccount do
  subject(:reader) { create :reader, :editor, name: 'Real Name', initials: 'RN' }

  let(:now) { Time.zone.parse('2026-11-12 10:00:00') }

  describe 'identity' do
    before { described_class.call(reader, now: now) }

    it 'replaces every identifying column' do
      reader.reload

      expect(reader).to be_anonymized
      expect(reader).to be_closed
      expect(reader.anonymized_at).to eq now
      expect(reader.read_attribute(:name)).to eq 'Deleted user'
      expect(reader.name).to eq 'Deleted user'
      expect(reader.initials).to be_nil
      expect(reader.email).to match(/\Adeleted-\h{8}-\h{4}-\h{4}-\h{4}-\h{12}@deleted\.invalid\z/)
      expect(reader.unconfirmed_email).to be_nil
      expect(reader.image_url).to be_nil
      expect(reader.current_sign_in_ip).to be_nil
      expect(reader.last_sign_in_ip).to be_nil
      expect(reader.reset_password_token).to be_nil
      expect(reader.confirmation_token).to be_nil
      expect(reader.send_reply_notifications).to be false
      expect(reader.active_community_id).to be_nil
    end

    it 'revokes the password and every role' do
      reader.reload

      expect(reader.valid_password?('secret')).to be false
      expect(reader.roles).to be_empty
      expect(reader.has_role?(:editor)).to be false
    end

    it 'gives each anonymized account its own identicon' do
      other = create :reader
      described_class.call(other, now: now)

      expect(reader.reload.hash_key).not_to eq other.reload.hash_key
    end
  end

  describe 'relationships' do
    let(:kase) { create :case }
    let(:library) { create :library }
    let!(:strategy) { create :authentication_strategy, :google, reader: reader }
    let!(:lock) { create :lock, reader: reader, lockable: kase }
    let!(:enrollment) { create :enrollment, reader: reader }
    let!(:membership) { create :group_membership, reader: reader }
    let!(:invitation) { create :invitation, reader: reader }
    let!(:sent_invitation) { create :invitation, inviter: reader }
    let!(:received_notification) { create :reply_notification, reader: reader }
    let!(:sent_notification) { create :reply_notification, comment: create(:comment, reader: reader) }
    let!(:library_request) { CaseLibraryRequest.create!(requester: reader, case: kase, library: library) }
    let!(:acknowledgement) { create :spotlight_acknowledgement, reader: reader }
    let!(:save) { create :reading_list_save, reader: reader }
    let!(:editorship) { Editorship.create!(editor: reader, case: kase) }
    let!(:managership) { create :managership, manager: reader, library: library }
    let!(:quiz) { create :quiz, author: reader }
    let!(:comment) { create :comment, reader: reader }
    let!(:reading_list) { create :reading_list, reader: reader }
    let!(:visit) { create :visit, user: reader }
    let!(:event) { create :ahoy_event, user: reader, visit: visit }

    before { described_class.call(reader, now: now) }

    it 'removes access and everything personal that carries no weight for others' do
      expect { strategy.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { lock.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { enrollment.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { membership.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { invitation.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { received_notification.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { sent_notification.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { library_request.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { acknowledgement.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { save.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'releases cases and libraries to their other editors and managers' do
      expect { editorship.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { managership.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect(kase.reload).to be_persisted
      expect(library.reload).to be_persisted
    end

    it 'unlinks what it sent or authored rather than destroying it' do
      expect(sent_invitation.reload.inviter_id).to be_nil
      expect(quiz.reload.author_id).to be_nil
    end

    it 'keeps contributions and activity, attributed to the pseudonymized row' do
      expect(comment.reload.reader).to eq reader
      expect(comment.reader.name).to eq 'Deleted user'
      expect(reading_list.reload.reader).to eq reader
      expect(visit.reload.user_id).to eq reader.id
      expect(event.reload.user_id).to eq reader.id
    end
  end

  describe 'quiz answers (register B1)' do
    let!(:answer) { create :answer, reader: reader, submission: create(:submission, reader: reader) }

    it 'keeps them by default' do
      described_class.call(reader, now: now, purge_quiz_answers: false)

      expect(answer.reload).to be_persisted
      expect(answer.submission.reload).to be_persisted
    end

    it 'deletes them when the flag is on' do
      described_class.call(reader, now: now, purge_quiz_answers: true)

      expect { answer.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect(Submission.where(reader: reader)).to be_empty
    end

    it 'reads the flag from configuration' do
      allow(Rails.configuration.x).to receive(:purge_quiz_answers_on_closure).and_return(true)

      described_class.call(reader, now: now)

      expect { answer.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'bookkeeping' do
    it 'completes the pending request' do
      request = Readers::CloseAccount.call(reader, now: now - 31.days)

      described_class.call(reader.reload, now: now)

      expect(request.reload.completed_at).to eq now
      expect(request).not_to be_pending
    end

    it 'works for an account that was never closed first, such as an admin-driven scrub' do
      expect { described_class.call(reader, now: now) }.not_to raise_error
      expect(reader.reload.closed_at).to eq now
    end

    it 'refuses to run twice' do
      described_class.call(reader, now: now)

      expect { described_class.call(reader.reload, now: now) }
        .to raise_error(Readers::AnonymizeAccount::AlreadyAnonymized)
    end

    it 'refuses when another copy of the reader was anonymized first' do
      stale = Reader.find(reader.id)
      described_class.call(reader, now: now)

      expect { described_class.call(stale, now: now) }
        .to raise_error(Readers::AnonymizeAccount::AlreadyAnonymized)
    end

    it 'returns a reader whose identicon no longer derives from the real email' do
      before = reader.hash_key

      expect(described_class.call(reader, now: now).hash_key).not_to eq before
    end

    it 'purges the profile image' do
      allow(reader.image).to receive(:attached?).and_return(true)
      allow(reader.image).to receive(:purge_later)

      described_class.call(reader, now: now)

      expect(reader.image).to have_received(:purge_later)
    end

    it 'releases locks through the cleanup job so other editors are told' do
      allow(CleanupLocksJob).to receive(:perform_now).and_call_original

      described_class.call(reader, now: now)

      expect(CleanupLocksJob).to have_received(:perform_now).with(reader_id: reader.id)
    end
  end
end
