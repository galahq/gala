# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Announcements index' do
  it 'lists the announcements the user needs to see' do
    announcement = create :announcement, content: 'Announcing announcements',
                                         url: 'example.com'

    reader = create :reader

    allow(class_double(Announcement))
      .to receive(:for_reader).with(reader).and_return [announcement]

    sign_in reader
    get announcements_path

    expect(response.body).to be_json including(
      including(
        param: announcement.id.to_s,
        content: 'Announcing announcements',
        url: 'example.com'
      )
    )
  end
end
