# frozen_string_literal: true

require 'rails_helper'

feature 'Viewing a deployment' do
  it 'shows the quiz details, the enrolled readers, and their engagement' do
    reader = create :reader
    group = create :group
    create :group_membership, reader: reader, group: group, status: :admin

    kase = create :case_with_elements
    quiz = create :quiz, case: kase, multiple_choice_question_count: 2
    create(:deployment, group: group, case: kase).tap do |d|
      d.answers_needed = 2
      d.quiz = quiz
      d.save
    end

    3.times do
      enrollment = create :enrollment, case: kase
      enrollment.reader.groups << group
    end

    login_as reader
    visit deployments_path

    expect(page).to have_content group.name
    click_on '3 enrolled'

    expect(page).to have_content "Deployment of “#{kase.kicker}”"
    expect(page).to have_content '2 Multiple Choice Questions'
    expect(page).to have_content '0%'
  end
end
