# frozen_string_literal: true

require 'rails_helper'

feature 'Editing a case' do
  let!(:kase) { create :case_with_elements }
  let!(:reader) { create :reader, :editor }

  before { login_as reader }

  context 'changing a card' do
    scenario 'is possible' do
      visit case_path('en', kase) + '/1'
      find('a', text: 'Edit this case').click
      expect(page).to have_content 'To edit this case, just change the text'

      first_paragraph = find('.DraftEditor-root p', match: :first)
      first_paragraph.click
      page.driver.browser.action
          .send_keys('Adding a test sentence for testing.').perform
      find('a', text: 'Save').click

      page.driver.browser.navigate.refresh
      expect(page).to have_content 'Adding a test sentence for testing.'
    end

    context 'with a comment thread' do
      let!(:global_forum) { kase.forums.find_by community: nil }
      let!(:comment_thread) do
        card = kase.pages.first.cards.first
        card.comment_threads.create(
          original_highlight_text: card.paragraphs.first[-20..-1],
          reader: reader,
          locale: I18n.locale,
          forum: global_forum
        )
      end

      scenario 'does not cause the comment thread to shift' do
        visit case_path('en', kase)
        click_button 'Enroll'
        find('a.c-toc__link', match: :first).click
        expect(page).to have_content 'RESPOND'

        find('a', text: 'Edit this case').click
        expect(page).to have_content 'To edit this case, just change the text'

        first_paragraph = find('.DraftEditor-root p', match: :first).native
        page.driver.browser.action
            .move_to(first_paragraph, 0, 10)
            .click
            .send_keys('Adding a test sentence for testing.')
            .perform
        find('a', text: 'Save').click

        page.driver.browser.navigate.refresh
        entity = find('span.c-comment-thread-entity', match: :first)
        expect(entity.text.strip)
          .to eq comment_thread.original_highlight_text.strip
      end
    end
  end
end
