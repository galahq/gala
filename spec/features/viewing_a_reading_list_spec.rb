# frozen_string_literal: true

require 'rails_helper'

feature 'Viewing a reading list' do
  it 'lists the cases included and their notes' do
    list = create_reading_list(
      title: 'Cool Cases List',
      description: 'This list has cases about cool stuff.',
      'Wolf Case' => 'Wolves are cool.',
      'Cat Case' => 'Cats are really cool.'
    )

    reader = create :reader
    login_as reader

    visit reading_list_path(list)

    expect(page).to have_content 'Cool Cases List'
    expect(page).to have_content 'This list has cases about cool stuff.'

    expect(page).to have_content 'Wolf Case'
    expect(page).to have_content 'Wolves are cool.'
    expect(page).to have_content 'Cat Case'
    expect(page).to have_content 'Cats are really cool'

    click_on 'Enroll', match: :first
    expect(page).to have_content('Enrolled')
    reader.reload
    expect(reader.enrolled_cases.where(kicker: 'Wolf Case')).to exist

    click_on 'Save Reading List'
    expect(page).to have_content 'Reading List Saved'
    reader.reload
    expect(reader.saved_reading_lists).to include list
  end

  def create_reading_list(kwargs)
    options = kwargs.extract!(:title, :description, :reader)

    create(:reading_list, **options).tap do |list|
      kwargs.each do |case_kicker, case_notes|
        kase = create :case, kicker: case_kicker
        list.items.create case: kase, notes: case_notes
      end
    end
  end
end
