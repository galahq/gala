# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Announcement dismissal create' do
  it 'sets the current reader’s seen_announcements_created_before timestamp ' \
     'to the announcement’s created_at timestamp' do
    reader = create :reader, seen_announcements_created_before: nil

    creation_time = 1.week.ago
    announcement = create :announcement, created_at: creation_time

    sign_in reader
    post announcement_dismissal_path announcement

    reader.reload

    expect(reader.seen_announcements_created_before).to eq creation_time
  end
end
