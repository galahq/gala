require 'rails_helper'

feature 'Signing up' do
  let(:name) { Faker::Internet.name }
  let(:email) { Faker::Internet.email }
  let(:password) { Faker::Internet.password }

  before { visit new_reader_registration_path }

  scenario 'with valid email and password' do
    fill_in 'Name', with: name
    fill_in 'Email', with: email
    fill_in 'Password', with: password, match: :first
    fill_in 'Password confirmation', with: password
    click_button 'Sign up'
    expect(page).to have_content "CONFIRMATION LINK"

    reader = Reader.find_by_email email
    visit reader_confirmation_path confirmation_token: reader.confirmation_token
    expect(page).to have_content "SUCCESSFULLY CONFIRMED"

    fill_in 'Email', with: email
    fill_in 'Password', with: password
    click_button 'Sign in'
    expect(page).to have_content "SIGNED IN SUCCESSFULLY"
  end
end
