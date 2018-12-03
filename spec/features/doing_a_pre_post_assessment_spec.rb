# frozen_string_literal: true

require 'rails_helper'

feature 'Doing a pre-/post-assessment' do
  let(:kase) { create :case_with_elements }
  let(:deployment) { create :deployment, :with_pretest, case: kase }
  let(:reader) { create :reader }

  scenario 'works' do
    login_as reader
    visit magic_link_path key: deployment.key
    click_on 'Let’s get started!'

    find('a', text: kase.pages.first.title).hover
    expect(page).to have_content 'Before you get started'
    click_on 'Take Pre-Quiz'

    expect(page).to have_content deployment.quiz.questions.first.content
    find('label', text: deployment.quiz.questions.first.options.sample)
      .click
    fill_in deployment.quiz.questions.second.content, with: 'Test'

    click_on 'Submit'
    sleep 1
    expect(all('.Card').count).to eq kase.pages.first.cards.count

    click_on 'Check your understanding'
    find('label', text: deployment.quiz.questions.first.options.sample)
      .click
    fill_in deployment.quiz.questions.second.content, with: 'Test'
    click_on 'Submit'
    expect(page).to have_content 'Thank you for your submission.'
  end
end
