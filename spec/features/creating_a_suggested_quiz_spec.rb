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
  end
end
