# frozen_string_literal: true

require 'rails_helper'

feature 'Unenrolling from a module' do
  let!(:reader) { create :reader, :editor }

  scenario 'is possible' do
    kase = create :case, :published
    kase.enrollments.create(reader: reader)

    login_as reader
    visit root_path

    find('[aria-label="Edit enrolled modules"]').click
    accept_confirm 'Are you sure you want to unenroll in this module?' do
      find('[aria-label="Unenroll from this module"]').click
    end
    page.driver.browser.navigate.refresh

    expect(page).not_to have_css '[aria-label="Edit enrolled modules"]'
  end

  scenario 'displays an extra warning if the module is not published' do
    kase = create :case
    kase.enrollments.create(reader: reader)

    login_as reader
    visit root_path

    find('[aria-label="Edit enrolled modules"]').click
    accept_confirm 'Because this module is not published, you will need another invitation to reenroll.' do
      find('[aria-label="Unenroll from this module"]').click
    end
    page.driver.browser.navigate.refresh

    expect(page).not_to have_css '[aria-label="Edit enrolled module"]'
  end
end
