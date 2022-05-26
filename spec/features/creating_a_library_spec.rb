# frozen_string_literal: true

require 'rails_helper'

feature 'Creating a library' do
  let(:reader) { create :reader, :editor }

  before { login_as reader }

  scenario 'is possible' do
    visit libraries_path
    expect(page).to have_content 'Create a New Library'

    fill_in 'Name', with: 'Michigan Sustainability Cases'
    fill_in 'Background Color', with: '#00274c'
    fill_in 'Foreground Color', with: '#ffcb05'
    attach_file file_fixture('block-m.png'), name: 'library[logo]'
    click_button 'Create Library'

    expect(page).to have_content 'successfully created'
    expect(page).to have_content 'Michigan Sustainability Cases'
  end
end
