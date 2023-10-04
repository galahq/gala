# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CleanupLocksJob, type: :job do
  describe '#perform' do
    let(:lockable1) { create(:case) }
    let(:lockable2) { create(:case_with_elements) }

    it 'unlocks resources for a specific reader_id' do
      reader_id = create(:reader).id
      reader_lock = create(:lock, lockable: lockable1, reader_id: reader_id)
      allow(Lock).to receive(:where).with(reader_id: reader_id)
                                    .and_return([reader_lock])

      expect(lockable1).to receive(:unlock)
      expect(BroadcastEdit).to receive(:to)
        .with(reader_lock, type: :destroy, session_id: nil)

      described_class.new.perform(reader_id: reader_id)
    end

    it 'unlocks resources based on the destroy_after time' do
      one_hour_old_lock = create(:lock, :one_hour_old, lockable: lockable1)
      eight_hours_old_lock = create(:lock, :eight_hours_old, lockable: lockable2)
      allow(Lock).to receive(:where).and_return([eight_hours_old_lock])
          
      expect(lockable1).not_to receive(:unlock)
      expect(BroadcastEdit).not_to receive(:to)
        .with(one_hour_old_lock, type: :destroy, session_id: nil)

      expect(lockable2).to receive(:unlock)
      expect(BroadcastEdit).to receive(:to)
        .with(eight_hours_old_lock, type: :destroy, session_id: nil)

      described_class.new.perform
    end
  end
end
