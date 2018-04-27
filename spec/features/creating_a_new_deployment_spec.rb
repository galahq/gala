# frozen_string_literal: true

require 'rails_helper'

feature 'Creating a new deployment' do
  let(:reader) { create :reader }
  before { login_as reader }

  scenario 'is possible' do
    kase = create :case, :published
    visit case_path 'en', kase
    click_button 'Teach this case'
    click_button 'Create Deployment'
    expect(page).to have_content 'Group name can’t be blank'

    select 'Create a New Study Group', from: 'Study Group'
    fill_in 'Group Name', with: 'My Study Group'
    click_button 'Create Deployment'
    expect(page).to have_content 'Deployment successfully created'

    click_button 'Invite Learners'
    expect(page).to have_content 'Send someone this link to invite them to study this case with you.'

    magic_link = find('[aria-label^="Invite link"]')
    visit magic_link.value
    expect(page).to have_content kase.title
    expect(page).to have_content 'My Study Group'

    cas = create :case, :published
    visit case_path 'en', cas
    click_button 'Teach this case'
    select 'My Study Group', from: 'Study Group'
    click_button 'Create Deployment'
    expect(page).to have_content 'Deployment successfully created'
    expect(page).to have_content 'Invite Learners', count: 2
  end
end
