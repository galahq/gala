# frozen_string_literal: true

require 'rails_helper'

feature 'Creating a new deployment' do
  let(:reader) { create :reader }
  before { login_as reader }

  scenario 'is possible' do
    kase = create :case, :published
    visit case_path kase
    click_on 'Deploy this Module'
    click_on 'Create Deployment'
    expect(page).to have_content 'Group name can’t be blank'

    select 'Create a New Study Group', from: 'Study Group'
    fill_in 'Group Name', with: 'My Study Group'
    click_on 'Create Deployment'
    expect(page).to have_content 'Deployment successfully created'

    click_on 'Invite Learners'
    expect(page).to have_content 'Send someone this link to invite them to study this module with you.'

    magic_link = find('[aria-label^="Invite link"]')
    visit magic_link.value
    expect(page).to have_content kase.title
    expect(page).to have_content 'My Study Group'

    cas = create :case, :published
    visit case_path cas
    click_on 'Deploy this Module'
    select 'My Study Group', from: 'Study Group'
    click_on 'Create Deployment'
    expect(page).to have_content 'Deployment successfully created'
    expect(page).to have_content 'Invite Learners', count: 2
  end

  context 'of the same module in the same group' do
    it 'shows an error message' do
      kase = create :case, :published
      visit case_path kase
      click_on 'Deploy this Module'
      click_on 'Create Deployment'
      expect(page).to have_content 'Group name can’t be blank'

      select 'Create a New Study Group', from: 'Study Group'
      fill_in 'Group Name', with: 'My Study Group'
      click_on 'Create Deployment'
      expect(page).to have_content 'Deployment successfully created'

      visit case_path kase
      click_on 'Deploy this Module'
      select 'My Study Group', from: 'Study Group'
      click_on 'Create Deployment'
      expect(page).to have_content 'Module has already been deployed in this study group'
    end
  end
end
