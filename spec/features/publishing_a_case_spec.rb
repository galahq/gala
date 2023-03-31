# frozen_string_literal: true

require 'rails_helper'

feature 'Publishing a module' do
  let!(:kase) { create :case }
  let!(:reader) { create :reader, :editor }

  scenario 'works' do
    login_as reader
    visit case_path kase

    accept_confirm 'Are you sure you want to change the publication status?' do
      click_button 'Options'
      click_link 'Publish this module'
    end
    sleep(1)
    page.driver.browser.navigate.refresh
    expect(page).not_to have_content 'This module is not yet published'

    accept_confirm 'Are you sure you want to change the publication status?' do
      click_button 'Options'
      click_link 'Unpublish this module'
    end
    sleep(1)
    page.driver.browser.navigate.refresh
    expect(page).to have_content 'This module is not yet published'
  end
end
