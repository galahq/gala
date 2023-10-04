# frozen_string_literal: true

require 'rails_helper'

feature 'Following a magic link' do
  let(:kase) { create :case, :published, :in_catalog }
  let(:deployment) { create :deployment, case: kase }

  context 'with an account' do
    let(:reader) { create :reader }

    scenario 'while not logged in' do
      visit magic_link_path key: deployment.key
      click_on 'Let’s get started!'
      login_as reader
      click_on 'Conversation'
      expect(page).to have_content deployment.group.name
    end

    scenario 'while logged in' do
      login_as reader
      visit magic_link_path key: deployment.key
      click_on 'Let’s get started!'
      click_on 'Conversation'
      expect(page).to have_content deployment.group.name
    end

    scenario 'and a previous enrollment' do
      login_as reader
      Enrollment.create reader: reader,
                        case: kase,
                        active_group_id: nil,
                        status: :instructor
      quiz_deployment = create :deployment, :with_pretest, case: kase
      visit magic_link_path key: quiz_deployment.key
      click_on 'Let’s get started!'
      click_on 'Conversation'
      expect(page).to have_content quiz_deployment.group.name
      click_on 'Overview'
      click_on 'Check your understanding'
      expect(page).to have_content 'Post-case quiz'
    end
  end

  scenario 'creating an account' do
    visit magic_link_path key: deployment.key
    click_on 'Let’s get started!'

    click_on 'Sign up'
    expect(page).to have_content 'Email can’t be blank'

    reader = build :reader
    fill_in 'Name', with: reader.name
    fill_in 'Email', with: reader.email
    fill_in 'Password', with: reader.password, match: :first
    fill_in 'Password confirmation', with: reader.password
    click_on 'Sign up'

    Capybara.reset_sessions!

    saved_reader = Reader.find_by_email reader.email
    visit reader_confirmation_path confirmation_token: saved_reader.confirmation_token

    click_on 'Sign in'
    fill_in 'Email', with: reader.email
    fill_in 'Password', with: reader.password
    click_on 'Sign in'
    check 'reader[terms_of_service]', allow_label_click: true
    click_button 'Continue'

    click_on 'Conversation'
    expect(page).to have_content deployment.group.name
  end

  scenario 'signing in with Google' do
    visit magic_link_path key: deployment.key
    click_on 'Let’s get started!'
    find('.oauth-icon-google').click
    check 'reader[terms_of_service]', allow_label_click: true
    click_button 'Continue'
    click_on 'Conversation'
    expect(page).to have_content deployment.group.name
  end
end
