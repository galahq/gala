# frozen_string_literal: true

require 'rails_helper'

feature 'Customizing a deployment' do
  context 'as a normal user' do
    let(:user) { create :reader }
    let(:deployment) { create :deployment }
    before { login_as user }

    scenario 'is not possible' do
      visit edit_deployment_path('en', deployment)
      expect(page).to have_content 'not authorized'
    end
  end

  context 'as a student' do
    let(:enrollment) { create :enrollment }
    let(:deployment) { create :deployment, case: enrollment.case }
    before { login_as enrollment.reader }

    scenario 'is not possible' do
      visit edit_deployment_path('en', deployment)
      expect(page).to have_content 'not authorized'
    end
  end

  context 'as an instructor' do
    let!(:group_membership) { create :group_membership, status: :admin }
    let!(:deployment) { create :deployment, group: group_membership.group }
    before { login_as group_membership.reader }

    scenario 'it is possible to create and edit a new quiz' do
      visit deployments_path
      expect(page).to have_content group_membership.group.name
      click_link 'Add Quiz'
      find('h4', text: 'Custom Assessment').click
      click_button 'Add question'
      fill_in placeholder: 'Question text', with: 'What is the color of the sky?'
      click_button 'Add option', match: :first
      find('.pt-control-group .pt-input').send_keys "Blue\nYellow\nRed\nGreen"
      click_button 'Deploy'
      expect(page).to have_content 'Please'
      all('.pt-radio').first.click
      click_button 'Deploy'

      click_link 'Edit Quiz'
      expect(page).to have_selector '.pt-input[value="What is the color of the sky?"]'
      click_button 'Add question'
      click_button 'Deploy'
      expect(page).to have_content 'Please'
      all('input.pt-input').last.set('Why is it that color?')
      click_button 'Deploy'
      expect(page).to have_content 'Please'
      find('textarea').set 'Because it is.'
      click_button 'Deploy'
      expect(page).to have_content 'Edit Quiz'
    end
  end
end
