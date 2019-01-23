# frozen_string_literal: true

require 'rails_helper'

feature 'Editing a comment' do
  context 'that is first in its thread' do
    scenario 'is possible' do
      reader = create :reader
      kase = create :case
      create :enrollment, reader: reader, case: kase
      forum = kase.forums.first
      thread = create :comment_thread, forum: forum, reader: reader
      comment = create :comment, reader: reader, comment_thread: thread

      login_as reader
      visit comment_thread_path thread
      expect(page).to have_content comment.content

      other_reader = create :reader
      create :enrollment, reader: other_reader, case: kase
      Capybara.using_session :other do
        login_as other_reader
        visit comment_thread_path thread
        expect(page).to have_content comment.content
      end

      click_button 'Edit comment'
      expect(page).to have_field 'Comment text', with: comment.content

      fill_in 'Comment text', with: 'Hello World!'
      click_button 'Save'

      expect(page).to have_no_content comment.content
      expect(page).to have_content 'Hello World!'
      expect(page).to have_content 'Edited'

      Capybara.using_session :other do
        expect(page).to have_no_content comment.content
        expect(page).to have_content 'Hello World!'
        expect(page).to have_content 'Edited'
      end
    end
  end

  context 'that is a response' do
    scenario 'is possible' do
      reader = create :reader
      kase = create :case
      create :enrollment, reader: reader, case: kase
      forum = kase.forums.first
      thread = create :comment_thread, forum: forum
      _lead_comment = create :comment, comment_thread: thread
      comment = create :comment, reader: reader, comment_thread: thread

      login_as reader
      visit comment_thread_path thread
      expect(page).to have_content comment.content

      other_reader = create :reader
      create :enrollment, reader: other_reader, case: kase
      Capybara.using_session :other do
        login_as other_reader
        visit comment_thread_path thread
        expect(page).to have_content comment.content
      end

      within '[data-testid="SelectedCommentThread"]' do
        find('blockquote', text: comment.content).hover
        click_button 'Edit comment'

        field = find('.public-DraftEditor-content', text: comment.content).click
        page.driver.browser.action.
          # Not to match content even if cursor is at beginning/end of input
          send_keys(:backspace, :delete)
            .send_keys('This is a great world!')
            .perform
        click_button 'Save'
      end

      expect(page).to have_no_content comment.content
      expect(page).to have_content 'This is a great world!'
      expect(page).to have_content 'edited'

      Capybara.using_session :other do
        expect(page).to have_no_content comment.content
        expect(page).to have_content 'This is a great world!'
        expect(page).to have_content 'edited'
      end
    end
  end
end
