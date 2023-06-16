# frozen_string_literal: true

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
    expect(page).to have_content 'confirmation link'

    reader = Reader.find_by_email email
    visit reader_confirmation_path confirmation_token: reader.confirmation_token
    expect(page).to have_content 'successfully confirmed'

    fill_in 'Email', with: email
    fill_in 'Password', with: password
    click_button 'Sign in'
    check 'reader[terms_of_service]', allow_label_click: true
    click_button 'Continue'

    expect(page).to have_content 'Welcome to Gala'
    click_button 'Choose', match: :first

    expect(page).to have_content 'Cases you enroll in will be presented here'

    reader.reload
    expect(reader.persona).to eq 'learner'
  end
end
