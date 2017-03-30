require 'rails_helper'

feature 'Leaving a comment' do
  let (:enrollment) { create :enrollment }

  before { login_as enrollment.reader }

  scenario 'is possible' do
    kase = enrollment.case
    visit case_path 'en', kase

    first_page = kase.pages.first
    click_link first_page.title
    expect(page).to have_link "Respond"
    click_link "Respond", match: :first

    first_paragraph = find '.DraftEditor-root p', match: :first
    first_paragraph.double_click
    click_button "Respond here"
    expect(page).to have_selector "textarea"

    fill_in placeholder: "Write a reply...", with: "Test comment"
    click_button "Submit"
    expect(page).to have_content "Test comment"
    expect(find("textarea").value).to be_blank
    save_screenshot

  end
end
