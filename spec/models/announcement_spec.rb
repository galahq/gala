# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Announcement, type: :model do
  describe '::deactivated' do
    it 'returns the right announcements' do
      a1 = create :announcement, deactivated_at: 1.week.ago
      a2 = create :announcement, deactivated_at: 1.week.since
      a3 = create :announcement, deactivated_at: nil

      expect(Announcement.deactivated).to include a1
      expect(Announcement.deactivated).not_to include a2, a3
    end
  end

  describe '::active' do
    it 'returns the right announcements' do
      a1 = create :announcement, deactivated_at: 1.week.ago
      a2 = create :announcement, deactivated_at: 1.week.since
      a3 = create :announcement, deactivated_at: nil

      expect(Announcement.active).not_to include a1
      expect(Announcement.active).to include a2, a3
    end
  end
end
