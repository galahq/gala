# frozen_string_literal: true

require 'rails_helper'

feature 'Deleting a module' do
  let!(:reader) { create :reader }

  let!(:kase) do
    create(:case_with_elements).tap { |c| reader.my_cases << c }
  end

  before(:each) { login_as reader }

  scenario 'is possible' do
    visit my_cases_path
    expect(page).to have_content kase.kicker
    click_on 'Delete module'

    expect(page).to have_content 'Are you sure you want to delete this module?'
    expect(page).to have_content 'This action cannot be undone'
    fill_in 'Please type in the title of the module to confirm', with: kase.kicker
    click_on 'I’m sure I want to delete this module'

    expect(page).to have_content 'Module successfully deleted'
    expect(page).not_to have_content kase.kicker
  end

  scenario 'requires the entered title to match' do
    kase.update(kicker: 'Right')

    visit my_cases_path
    expect(page).to have_content kase.kicker
    click_on 'Delete module'
    expect(page)
      .to have_button 'I’m sure I want to delete this module', disabled: true

    fill_in 'Please type in the title of the module to confirm', with: 'Wrong'
    expect(page)
      .to have_button 'I’m sure I want to delete this module', disabled: true

    execute_script <<~JS
      document.getElementById("new_confirm_deletion_form").submit()
    JS
    expect(page).to have_content(
      'Confirmation of module title does not match the expected value'
    )
  end

  scenario 'doesn’t ask for confirmation when there’s no title set' do
    kase.update(kicker: '')

    visit my_cases_path
    expect(page).to have_content kase.title
    click_on 'Delete module'

    expect(page).to have_content 'Untitled Module'
    expect(page)
      .not_to have_field 'Please type in the title of the module to confirm'

    click_on 'I’m sure I want to delete this module'
    expect(page).to have_content 'Module successfully deleted'
    expect(page).not_to have_content kase.title
  end
end
