# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AccountDeletionRequest, type: :model do
  it { should belong_to(:reader) }
  it { should validate_presence_of(:requested_at) }
  it { should validate_presence_of(:scheduled_for) }

  it 'has a 30-day grace period (register A13)' do
    expect(described_class::GRACE_PERIOD).to eq 30.days
  end

  describe 'scopes' do
    let!(:fresh) { create :account_deletion_request }
    let!(:due) { create :account_deletion_request, :due }
    let!(:restored) { create :account_deletion_request, :due, restored_at: 2.days.ago }
    let!(:completed) { create :account_deletion_request, :due, completed_at: 1.hour.ago }

    it '.pending excludes restored and completed requests' do
      expect(described_class.pending).to contain_exactly(fresh, due)
    end

    it '.due is the pending requests whose grace period has passed' do
      expect(described_class.due).to contain_exactly(due)
    end

    it '.due accepts a reference time' do
      expect(described_class.due(31.days.from_now)).to contain_exactly(fresh, due)
    end
  end

  it 'allows only one pending request per reader' do
    request = create :account_deletion_request

    expect { create :account_deletion_request, reader: request.reader }
      .to raise_error(ActiveRecord::RecordNotUnique)
    expect { create :account_deletion_request, reader: request.reader, restored_at: Time.current }
      .not_to raise_error
  end
end
