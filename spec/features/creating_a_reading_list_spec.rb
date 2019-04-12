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
    fill_in 'Description', with: 'These are cool cases.'

    # TODO: Add a case

    click_on 'Create Reading List'

    expect(page).to have_content 'My Reading List'
    expect(page).to have_content 'These are cool cases.'

    reader.reload
    list = reader.reading_lists.order(:created_at).last
    expect(list.title).to eq 'My Reading List'
    expect(list.description).to eq 'These are cool cases.'
  end
end
