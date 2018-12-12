# frozen_string_literal: true

require 'rails_helper'

feature 'Adding a collaborator' do
  let!(:reader) { create :reader }
  let!(:case_study) do
    create(:case).tap { |c| reader.my_cases << c }
  end

  before { login_as reader }

  context 'with an account' do
    scenario 'is possible' do
      collaborator = create :reader

      visit case_path case_study
      click_on 'Edit this case'
      click_on 'Add Collaborator'

      fill_in 'Collaborator’s Email', with: collaborator.email
      click_on 'Add Collaborator'

      expect(page).to have_content 'Editorship successfully created'
      expect(page).to have_content collaborator.name
    end
  end

  context 'without an account' do
    scenario 'shows an error message' do
      visit case_path case_study
      click_on 'Edit this case'
      click_on 'Add Collaborator'

      fill_in 'Collaborator’s Email', with: 'nonexistantuser@email.com'
      click_on 'Add Collaborator'

      expect(page).to have_content 'collaborator’s account could not be found'
    end
  end
end
