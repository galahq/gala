# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lockable do
  describe '#lock_by' do
    let(:lockable) { create :case }
    let(:reader) { create :reader }

    it 'returns an existing lock held by the same reader' do
      existing_lock = lockable.lock_by reader

      expect { expect(lockable.lock_by(reader)).to eq existing_lock }
        .not_to change(Lock, :count)
    end

    it 'returns nil when another reader already holds the lock' do
      lockable.lock_by reader

      expect(lockable.lock_by(create(:reader))).to be_nil
    end
  end
end
