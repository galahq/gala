# frozen_string_literal: true

require 'rails_helper'

feature 'Creating a suggested quiz' do
  let(:reader) { create :reader }
  let(:case_study) do
    create(:case, :published).tap { |k| reader.my_cases << k }
  end

  before(:each) { login_as reader }

  scenario 'is possible' do
    visit case_path(case_study, edit: true)
    click_on 'Pre/Post Assessment'
    expect(page).to have_content 'Suggested Quizzes'

    click_on 'New Quiz'
    fill_in 'Quiz title', with: 'My Suggested Quiz'
    click_on 'Add question'
    fill_in 'Question text', with: 'What is your favorite color?'

    click_on 'All Suggested Quizzes'
    expect(page).to have_content 'My Suggested Quiz'
    expect(page).to have_content '1 Open Ended Question'

    click_on 'Save'
    expect(page).to have_content 'Saved successfully'

    other_reader = create :reader
    Capybara.using_session :other do
      login_as other_reader
      visit case_path case_study
      click_on 'Deploy this Case'

      select 'Create a New Study Group', from: 'Study Group'
      fill_in 'Group Name', with: 'My Study Group'
      click_on 'Create Deployment'
      click_on 'Add Quiz'
      expect(page).to have_content 'What is your favorite color?'
    end
  end
end
