require 'rails_helper'

feature 'Signing up' do
  let(:password) { Faker::Internet.password }

  before { visit new_reader_registration_path }

  scenario 'with valid email and password' do
    fill_in 'Name', with: Faker::Name.name
    fill_in 'Email', with: Faker::Internet.email
    fill_in 'Password', with: password, match: :first
    fill_in 'Password confirmation', with: password
    click_button 'Sign up'

    expect(page).to have_content "SIGNED UP SUCCESSFULLY"
  end
end
