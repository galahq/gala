# frozen_string_literal: true

require 'rails_helper'

feature 'Editing a comment' do
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

      find('blockquote', text: comment.content).hover
      click_button 'Edit comment'
    end
  end
end
