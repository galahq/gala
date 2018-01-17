# frozen_string_literal: true

require 'rails_helper'

feature 'Editing a case' do
  let!(:kase) { create :case_with_elements }
  let!(:reader) { create :reader, :editor }

  before { login_as reader }

  context 'adding a card' do
    scenario 'is possible' do
      visit case_path('en', kase) + '/1'
      expect(page).to have_selector('.Card', count: 5)

      click_button 'Options'
      sleep(1)
      click_link 'Edit this case'
      click_button('Add card', match: :first)
      sleep(1)
      page.driver.browser.navigate.refresh
      expect(page).to have_selector('.Card', count: 6)
    end
  end

  context 'changing a card' do
    scenario 'is possible' do
      visit case_path('en', kase) + '/1'
      # It gets confused the first time the menu mounts >.<
      3.times { click_button 'Options' }
      click_link 'Edit this case'
      expect(page).to have_content 'To edit this case, just change the text'

      first_paragraph = find('.DraftEditor-root div[data-block]', match: :first)
      first_paragraph.click
      page.driver.browser.action
          .send_keys('Adding a test sentence for testing.').perform
      click_button 'Options'
      click_link 'Save'

      page.driver.browser.navigate.refresh
      expect(page).to have_content 'Adding a test sentence for testing.'
    end

    context 'by adding and removing Edgenotes' do
      scenario 'is possible' do
        visit case_path('en', kase) + '/1'
        3.times { click_button 'Options' }
        click_link 'Edit this case'

        # Try to attach an edgenote without a selection and expect an error
        edgenote_button = find('button[aria-label*="edgenote"]', match: :first)
        edgenote_button.click
        expect(page).to have_content(
          'Please select the phrase that you would ' \
          'like to attach an Edgenote to.'
        )

        # Add an Edgenote and fill in a quotation
        first_paragraph = find('.DraftEditor-root div[data-block]',
                               match: :first)
        first_paragraph.double_click

        edgenote_button.click
        expect(page).to have_selector '.c-edgenote-entity'
        expect(page).to have_content '“Add quotation...”'

        find('.pt-editable-text', text: '“Add quotation...”').click
        page.driver.browser.action.send_keys('“I have a dream”').perform

        # Remove the Edgenote by clicking the button again
        page.driver.browser.action.move_to(
          find('.c-edgenote-entity').native
        ).click.perform
        edgenote_button.click
        expect(page).not_to have_content '“I have a dream”'

        # Reattach the Edgenote from the library
        first_paragraph.double_click
        edgenote_button.click
        expect(page).to have_content 'Unused Edgenotes'
        find('button[aria-label="Attach this Edgenote."]').click
        expect(page).not_to have_content 'Unused Edgenotes'
        expect(page).to have_content '“I have a dream”'

        # The Edgenote should persist on save
        click_button 'Options'
        click_link 'Save'
        page.driver.browser.navigate.refresh
        expect(page).to have_content '“I have a dream”'
      end
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
        visit case_path('en', kase) + '/1'
        expect(page).to have_content 'RESPOND'

        click_button 'Options'
        click_link 'Edit this case'
        expect(page).to have_content 'To edit this case, just change the text'

        first_paragraph = find('.DraftEditor-root div[data-block]',
                               match: :first).native
        page.driver.browser.action
            .move_to(first_paragraph, 0, 10)
            .click
            .send_keys('Adding a test sentence for testing.')
            .perform
        click_button 'Options'
        click_link 'Save'

        page.driver.browser.navigate.refresh
        entity = find('span.c-comment-thread-entity', match: :first)
        expect(entity.text.strip)
          .to eq comment_thread.original_highlight_text.strip
      end
    end
  end

  context 'removing a card' do
    scenario 'is possible' do
      visit case_path('en', kase) + '/1'
      expect(page).to have_selector('.Card', count: 5)

      click_button 'Options'
      click_link 'Edit this case'
      accept_confirm(
        'Are you sure you want to delete this card and its associated comments?'
      ) do
        find('.Card', match: :first).hover
        within('.Card', match: :first) do
          find('.pt-icon-trash').click
        end
      end
      sleep(1)
      page.driver.browser.navigate.refresh
      expect(page).to have_selector('.Card', count: 4)
    end
  end
end
