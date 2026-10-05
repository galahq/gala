# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reader, type: :model do
  subject { build :reader }

  it { should have_many(:reading_lists).dependent(:destroy) }
  it { should have_many(:reading_list_saves).dependent(:destroy) }
  it { should have_many(:saved_reading_lists).through(:reading_list_saves) }
  it { should have_many :spotlight_acknowledgements }

  # Every table carrying a reader foreign key needs a declared association with
  # a deliberate `dependent:`. Undeclared ones don't fail loudly — they either
  # raise InvalidForeignKey mid-delete or silently orphan their rows, which is
  # how five accounts were destroyed in production leaving 53 rows behind.
  describe 'associations that must survive account deletion' do
    it { should have_many(:locks).dependent(:destroy) }
    it { should have_many(:case_library_requests).dependent(:destroy) }
    it { should have_many(:reply_notifications).dependent(:destroy) }
    it { should have_many(:sent_reply_notifications).dependent(:destroy) }
    it { should have_many(:sent_invitations).dependent(:nullify) }
    it { should have_many(:authored_quizzes).dependent(:nullify) }

    # Interim pending the FERPA retention determination (E1): rows are kept,
    # only the link to the departed reader is cleared.
    it { should have_many(:events).dependent(:nullify) }
    it { should have_many(:visits).dependent(:nullify) }
  end

  describe 'account closure' do
    it { should have_many(:account_deletion_requests).dependent(:destroy) }
    it { should have_one(:pending_account_deletion_request) }

    it 'is open by default' do
      reader = build_stubbed :reader

      expect(reader).not_to be_closed
      expect(reader).not_to be_anonymized
    end

    it 'presents a closed account as "Deleted user" while keeping the stored name' do
      reader = build_stubbed :reader, name: 'Real Name', closed_at: Time.current

      expect(reader).to be_closed
      expect(reader.name).to eq 'Deleted user'
      expect(reader.read_attribute(:name)).to eq 'Real Name'
    end

    it '.active excludes closed accounts' do
      open_reader = create :reader
      closed_reader = create :reader, closed_at: Time.current

      expect(Reader.active).to include(open_reader)
      expect(Reader.active).not_to include(closed_reader)
    end
  end

  # Regression coverage for the account deletions found in production in
  # August 2026. Two shapes of failure: an undeclared association with a
  # database foreign key raised InvalidForeignKey partway through the delete,
  # and an undeclared association without one silently orphaned its rows.
  describe '#destroy' do
    subject(:reader) { create :reader }

    it 'succeeds for a reader holding an edit lock' do
      create :lock, reader: reader
      expect { reader.destroy! }.to change(Lock, :count).by(-1)
    end

    it 'succeeds for a reader with a pending library request' do
      CaseLibraryRequest.create!(requester: reader, case: create(:case),
                                 library: create(:library))
      expect { reader.destroy! }
        .to change(CaseLibraryRequest, :count).by(-1)
    end

    it 'takes reply notifications it received with it' do
      create :reply_notification, reader: reader

      expect { reader.destroy! }.to change(ReplyNotification, :count).by(-1)
    end

    it 'takes reply notifications it sent with it' do
      # The factory makes the comment's author the notifier.
      create :reply_notification, comment: create(:comment, reader: reader)

      expect { reader.destroy! }.to change(ReplyNotification, :count).by(-1)
    end

    it 'unlinks invitations it sent rather than destroying them' do
      invitation = create :invitation, inviter: reader

      expect { reader.destroy! }.not_to change(Invitation, :count)
      expect(invitation.reload.inviter_id).to be_nil
    end

    it 'unlinks quizzes it authored rather than destroying them' do
      quiz = create :quiz, author: reader

      expect { reader.destroy! }.not_to change(Quiz, :count)
      expect(quiz.reload.author_id).to be_nil
    end

    # Interim pending the FERPA retention decision (E1): the activity rows
    # stay, unlinked. Nothing may point at a reader that no longer exists —
    # that is exactly the orphan state the 53 rows were in.
    it 'unlinks visits and events rather than destroying or orphaning them' do
      visit = create :visit, user: reader
      event = create :ahoy_event, user: reader, visit: visit

      expect { reader.destroy! }
        .not_to(change { [Visit.count, Ahoy::Event.count] })
      expect(visit.reload.user_id).to be_nil
      expect(event.reload.user_id).to be_nil
    end
  end

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

  describe '#request_for_case' do
    let(:reader) { create :reader }
    let(:library) { create :library }
    let(:kase) { create :case }

    before { create :managership, library: library, manager: reader }

    # Regression: this used to query from `managerships` and return a
    # Managership, so callers that expect a CaseLibraryRequest (e.g. the case
    # show cache key calling `#status`) raised NoMethodError.
    it 'returns the CaseLibraryRequest for a case requested in a managed library' do
      request = CaseLibraryRequest.create!(
        case: kase, library: library, requester: create(:reader), status: :pending
      )

      result = reader.request_for_case(kase)

      expect(result).to eq request
      expect(result).to be_a CaseLibraryRequest
      expect(result.status).to eq 'pending'
    end

    it 'returns nil when no request exists for the case' do
      expect(reader.request_for_case(kase)).to be_nil
    end
  end
end
