# frozen_string_literal: true

require 'rails_helper'

feature 'Editing a suggested quiz' do
  let(:reader) { create :reader }

  before(:each) { login_as reader }

  scenario 'is possible' do
    quiz = create(:quiz, :suggested, title: 'Quiz Title', open_ended_question_count: 2)
    reader.my_cases << quiz.case

    visit case_path(quiz.case, edit: true)
    click_on 'Pre/Post Assessment'
    expect(page).to have_content 'Quiz Title'

    click_on quiz.title
    click_on 'Add question'
    all('input[placeholder="Question text"]').last.set 'What’s up?'
    all('textarea[placeholder^="Enter a sample answer"]').last.set 'Not much...'
    click_on 'Save'

    find('.bp6-dialog-close-button').click
    expect(page).to have_no_selector '.bp6-dialog'

    visit case_path(quiz.case, edit: true)
    click_on 'Pre/Post Assessment'
    expect(page).to have_content '3 Open Ended Questions'
  end

  scenario 'it discards unsaved changes when the dialog is closed' do
    quiz = create :quiz, :suggested
    reader.my_cases << quiz.case

    visit case_path(quiz.case, edit: true)
    click_on 'Pre/Post Assessment'
    click_on quiz.title
    click_on 'Add question'

    find('.bp6-dialog-close-button').click
    expect(page).to have_no_selector '.bp6-dialog'

    click_on 'Pre/Post Assessment'
    click_on quiz.title
    expect(page).to have_selector(
      'input[placeholder="Question text"]', count: quiz.questions.count
    )
  end

  context 'not in edit mode' do
    scenario 'it redirects to the overview' do
      quiz = create :quiz
      reader.my_cases << quiz.case

      visit case_path(quiz.case) + '/suggested_quizzes'
      expect(page).not_to have_content 'Suggested Quizzes'
    end
  end
end
