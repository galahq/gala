# frozen_string_literal: true

require 'rails_helper'

feature 'Editing a library', javascript: false do
  let(:reader) { create :reader }
  let!(:library) { reader.libraries.create attributes_for :library }

  before { login_as reader }

  it 'is possible' do
    visit libraries_path
    find('[aria-label="Edit"]').click
    fill_in 'Description', with: 'A description'
    click_button 'Update Library'
    expect(page).to have_content 'successfully updated'
    expect(page).to have_content 'A description'
  end

  it 'is possible to invite other managers' do
    other_reader = create :reader
    visit edit_library_path library
    click_link 'Add Manager'
    fill_in 'Manager’s Email', with: other_reader.email
    click_button 'Add Manager'

    Capybara.using_session 'other' do
      login_as other_reader
      visit edit_library_path library
      expect(page).to have_content 'Edit Library'
      expect(page).to have_content other_reader.name
    end
  end

  it 'is possible to add a case to it' do
    kase = create :case
    reader.my_cases << kase

    visit edit_case_settings_path kase
    select library.name, from: 'Library'
    click_button 'Change library'
    expect(page).to have_content 'successfully updated'

    kase.reload
    expect(kase.library_id).to eq library.id
  end
end
