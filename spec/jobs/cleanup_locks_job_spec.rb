# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CleanupLocksJob, type: :job do
  describe '#perform' do
    let(:bob) { create(:reader, name: 'bob') }
    let(:alice) { create(:reader, name: 'alice') }

    it 'unlocks resources for a specific reader_id' do
      create(:lock, reader: bob)
      create_list(:lock, 2, :one_hour_old, reader: alice)
      job = described_class.new
      expect { job.perform(reader_id: bob.id) }.to change { Lock.count }.by(-1)
    end

    it 'unlocks resources based on destroy_after time' do
      create(:lock, reader: bob)
      create_list(:lock, 2, :eight_hours_old, reader: alice)
      job = described_class.new
      expect { job.perform }.to change { Lock.count }.by(-2)
    end
  end
end
