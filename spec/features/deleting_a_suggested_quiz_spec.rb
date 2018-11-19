# frozen_string_literal: true

require 'rails_helper'

feature 'Deleting a suggested quiz' do
  let(:reader) { create :reader }

  before(:each) { login_as reader }

  scenario 'is possible' do
    quiz = create :quiz
    reader.my_cases << quiz.case

    visit case_path(quiz.case, edit: true)
    click_on 'Pre/Post Assessment'

    sleep 1
    accept_confirm 'Are you sure you want to delete this quiz?' do
      click_on 'Delete Quiz'
    end

    expect(page).to have_content 'Quiz successfully deleted'
    expect(page).not_to have_content quiz.title
  end
end
