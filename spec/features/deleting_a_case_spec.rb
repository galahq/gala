# frozen_string_literal: true

require 'rails_helper'

feature 'Deleting a case' do
  let!(:reader) { create :reader }

  let!(:kase) do
    create(:case, :unpublished).tap { |c| reader.my_cases << c }
  end

  before { login_as reader }

  scenario 'is possible' do
    visit my_cases_path
    expect(page).to have_content kase.kicker
    click_on 'Delete case'

    expect(page).to have_content 'Are you sure you want to delete this case?'
    expect(page).to have_content 'This action cannot be undone'
    fill_in 'Please type in the title of the case to confirm', with: kase.kicker
    click_on 'I’m sure I want to delete this case'

    expect(page).to have_content 'Case successfully deleted'
    expect(page).not_to have_content kase.kicker
  end

  scenario 'requires the entered title to match' do
    kase.update(kicker: 'Right')

    visit my_cases_path
    expect(page).to have_content kase.kicker
    click_on 'Delete case'
    expect(page)
      .to have_button 'I’m sure I want to delete this case', disabled: true

    fill_in 'Please type in the title of the case to confirm', with: 'Wrong'
    expect(page)
      .to have_button 'I’m sure I want to delete this case', disabled: true

    execute_script <<~JS
      document.getElementById("new_confirm_deletion_form").submit()
    JS
    expect(page).to have_content(
      'Confirmation of case title does not match the expected value'
    )
  end

  scenario 'doesn’t ask for confirmation when there’s no title set' do
    kase.update(kicker: '')

    visit my_cases_path
    expect(page).to have_content kase.title
    click_on 'Delete case'

    expect(page).to have_content 'Untitled Case'
    expect(page)
      .not_to have_field 'Please type in the title of the case to confirm'

    click_on 'I’m sure I want to delete this case'
    expect(page).to have_content 'Case successfully deleted'
    expect(page).not_to have_content kase.title
  end
end
