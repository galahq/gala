# frozen_string_literal: true

require 'rails_helper'

feature 'Creating a reading list' do
  it 'is possible' do
    reader = create :reader
    kase = create :case, kicker: 'A Cool Case'
    create :enrollment, case: kase, reader: reader

    login_as reader

    visit root_path
    click_on 'New Reading List'

    fill_in 'Title', with: 'My Reading List'
    fill_in 'Description', with: 'These are cool cases'

    click_on 'Add'
    fill_in 'Notes', with: 'I think this is cool'

    click_on 'Create Reading List'

    expect(page).to have_content 'My Reading List'
    expect(page).to have_content 'These are cool cases'
    expect(page).to have_content 'A Cool Case'
    expect(page).to have_content 'I think this is cool'

    reader.reload
    list = reader.reading_lists.order(:created_at).last
    expect(list.title).to eq 'My Reading List'
    expect(list.description).to eq 'These are cool cases'
    expect(list.reading_list_items.where(notes: 'I think this is cool'))
      .not_to be_empty
    expect(list.cases).to include kase
  end
end
