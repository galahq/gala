# frozen_string_literal: true

require 'rails_helper'

feature 'Publishing a case' do
  let!(:kase) { create :case_with_elements }
  let!(:reader) { create :reader, :editor }

  scenario 'works' do
    login_as reader
    visit case_path('en', kase)
    find('a', text: 'Publish this case').click

    accept_confirm 'Are you sure you want to change the publication status?'
    page.driver.browser.navigate.refresh
    expect(page).to have_content 'Unpublish this case'

    find('a', text: 'Unpublish this case').click
    accept_confirm 'Are you sure you want to change the publication status?'
    page.driver.browser.navigate.refresh
    expect(page).to have_content 'Publish this case'
  end
end
