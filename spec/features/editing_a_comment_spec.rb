# frozen_string_literal: true

require 'rails_helper'

feature 'Editing a comment' do
  around do |example|
    previous_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :inline
    example.run
  ensure
    ActiveJob::Base.queue_adapter = previous_adapter
  end

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

      travel 10.minutes

      within '[data-testid="SelectedCommentThread"]' do
        comment_container = find('blockquote', text: comment.content)
                            .find(
                              :xpath,
                              "ancestor::div[.//button[@aria-label='Edit comment']][1]"
                            )
        comment_container.hover
        comment_container.click_button 'Edit comment'

        edit_form = find('button[aria-label="Save comment"]')
                    .find(:xpath, '..')
        editor = edit_form.find(
          '.public-DraftEditor-content[contenteditable="true"]'
        )
        editor.click
        select_all = RUBY_PLATFORM.include?('darwin') ? :command : :control
        editor.send_keys([select_all, 'a'], 'Hello World!')
        click_button 'Save'
      end

      expect(page).to have_no_content comment.content
      expect(page).to have_content 'Hello World!'
      expect(page).to have_content 'edited'

      Capybara.using_session :other do
        expect(page).to have_no_content comment.content
        expect(page).to have_content 'Hello World!'
        expect(page).to have_content 'edited'
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

      travel 10.minutes

      within '[data-testid="SelectedCommentThread"]' do
        comment_container = find('blockquote', text: comment.content)
                            .find(
                              :xpath,
                              "ancestor::div[.//button[@aria-label='Edit comment']][1]"
                            )
        comment_container.hover
        comment_container.click_button 'Edit comment'

        edit_form = find('button[aria-label="Save comment"]')
                    .find(:xpath, '..')
        editor = edit_form.find(
          '.public-DraftEditor-content[contenteditable="true"]'
        )
        editor.click
        select_all = RUBY_PLATFORM.include?('darwin') ? :command : :control
        editor.send_keys([select_all, 'a'], 'This is a great world!')
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
