require 'rails_helper'

feature 'Signing in with Google' do
  before { visit root_path }

  context 'without a password' do

    scenario 'is possible' do
      # Omniauth test mode will return { name: 'Test User', email: 'test@gmail.com'}
      find('.oauth-icon-google').click
      expect(page).to have_content 'Hello'
    end

    scenario 'user can create a password' do
      find('.oauth-icon-google').click
      find('#reader-icon').click
      click_link 'My Account'
      fill_in 'Password', with: 'new password'
      click_button 'Create a password'

      find('#reader-icon').click
      click_link 'Sign out'
      fill_in 'Email', with: Reader.take.email
      fill_in 'Password', with: 'new password'
      click_button 'Sign in'
      expect(page).to have_content 'Hello'
    end

  end
end
