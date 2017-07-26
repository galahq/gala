# frozen_string_literal: true

require 'rails_helper'

feature 'Following a magic link' do
  let(:kase) { create :case, :published, :in_catalog }
  let(:deployment) { create :deployment, case: kase }

  context 'with an account' do
    let(:reader) { create :reader }

    scenario 'while not logged in' do
      visit new_enrollment_path key: deployment.key
      click_button 'Let’s get started!'
      login_as reader
      expect(page).to have_content deployment.group.name
      expect(page).not_to have_content 'Enroll in this case'
    end

    scenario 'while logged in' do
      login_as reader
      visit new_enrollment_path key: deployment.key
      click_button 'Let’s get started!'
      expect(page).to have_content deployment.group.name
      expect(page).not_to have_content 'Enroll in this case'
    end
  end

  scenario 'creating an account' do
    visit new_enrollment_path key: deployment.key
    click_button 'Let’s get started!'
    reader = build :reader
    fill_in 'Name', with: reader.name
    fill_in 'Email', with: reader.email
    fill_in 'Password', with: reader.password, match: :first
    fill_in 'Password confirmation', with: reader.password
    click_button 'Sign up'
    Capybara.reset_sessions!
    saved_reader = Reader.find_by_email reader.email
    visit reader_confirmation_path confirmation_token: saved_reader.confirmation_token
    fill_in 'Email', with: reader.email
    fill_in 'Password', with: reader.password
    click_button 'Sign in'
    expect(page).to have_content deployment.group.name
    expect(page).not_to have_content 'Enroll in this case'
  end

  scenario 'signing in with Google' do
    visit new_enrollment_path key: deployment.key
    click_button 'Let’s get started!'
    find('.oauth-icon-google').click
    expect(page).to have_content deployment.group.name
    expect(page).not_to have_content 'Enroll in this case'
  end
end
