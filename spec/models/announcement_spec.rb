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

  describe '::for_reader' do
    it 'returns the active announcements created after the reader’s most ' \
       'recently seen' do
      newer = create :announcement, created_at: 1.week.ago
      older = create :announcement, created_at: 3.weeks.ago

      deactivated = create :announcement, created_at: 1.week.ago,
                                          deactivated_at: 2.days.ago

      reader = create :reader, seen_announcements_created_before: 2.weeks.ago

      announcements = Announcement.for_reader reader

      expect(announcements).to include newer
      expect(announcements).not_to include older, deactivated
    end

    it 'returns all active announcements if the reader hasn’t seen any' do
      newer = create :announcement, created_at: 1.week.ago
      older = create :announcement, created_at: 3.weeks.ago

      deactivated = create :announcement, created_at: 1.week.ago,
                                          deactivated_at: 2.days.ago

      reader = create :reader, seen_announcements_created_before: nil

      announcements = Announcement.for_reader reader

      expect(announcements).to include newer, older
      expect(announcements).not_to include deactivated
    end
  end
end
