# frozen_string_literal: true

require 'rails_helper'

feature 'Editing a case' do
  let!(:reader) { create :reader, :editor }

  before { login_as reader }

  context 'adding a card' do
    scenario 'is possible' do
      kase = create :case_with_edgenotes
      visit case_path(kase) + '/1'
      expect(page).to have_selector('.Card', count: 5)

      click_button 'Edit this case'
      click_button('Add card', match: :first)
      sleep(1)
      page.driver.browser.navigate.refresh
      expect(page).to have_selector('.Card', count: 6)
    end
  end

  context 'changing a card' do
    scenario 'is possible' do
      kase = create :case_with_edgenotes
      visit case_path(kase) + '/1'
      click_button 'Edit this case'
      expect(page).to have_content 'To edit this case, just change the text'

      first_paragraph = find('.DraftEditor-root div[data-block]', match: :first)
      first_paragraph.click
      page.driver.browser.action
          .send_keys('Adding a test sentence for testing.').perform

      expect(kase.pages.first.cards.first).to be_locked
      click_button 'Save'
      expect(page).to have_content 'Saved successfully'
      expect(kase.pages.first.cards.first).not_to be_locked

      page.driver.browser.navigate.refresh
      expect(page).to have_content 'Adding a test sentence for testing.'
    end

    context 'by adding and removing Edgenotes' do
      scenario 'is possible' do
        kase = create :case_with_elements
        visit case_path(kase) + '/1'
        click_button 'Edit this case'

        # Try to attach an edgenote without a selection and expect an error
        edgenote_button = find('button[aria-label*="edgenote"]', match: :first)
        edgenote_button.click
        expect(page).to have_content(
          'Please select the phrase that you would ' \
          'like to attach an Edgenote to'
        )

        # Add an Edgenote and fill in a quotation
        first_paragraph = find('.DraftEditor-root div[data-block]',
                               match: :first)
        first_paragraph.double_click

        edgenote_button.click
        expect(page).to have_selector '.c-edgenote-entity'

        find('[data-test-id=edgenote]').hover
        click_button 'Edit'
        fill_in 'Pull quote', with: '“I have a dream”'
        click_button 'Save Edgenote'

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
        click_button 'Save'
        expect(page).to have_content 'Saved successfully'
        page.driver.browser.navigate.refresh
        expect(page).to have_content '“I have a dream”'
      end
    end

    context 'with a comment thread' do
      let!(:kase) { create :case_with_edgenotes }
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
        visit case_path(kase)
        click_button 'Enroll'
        visit case_path(kase) + '/1'
        expect(page).to have_content 'RESPOND'

        click_button 'Edit this case'
        expect(page).to have_content 'To edit this case, just change the text'

        first_paragraph = find('.DraftEditor-root div[data-block]',
                               match: :first).native
        page.driver.browser.action
            .move_to(first_paragraph, 0, 10)
            .click
            .send_keys('Adding a test sentence for testing.')
            .perform
        click_button 'Save'
        expect(page).to have_content 'Saved successfully'

        page.driver.browser.navigate.refresh
        entity = find('span.c-comment-thread-entity', match: :first)
        expect(entity.text.strip)
          .to eq comment_thread.original_highlight_text.strip
      end

      scenario 'detaches the comment thread if its text is changed' do
        comment_thread.comments.create! content: 'Test comment', reader: reader
        visit case_path kase
        click_on 'Enroll'
        visit case_path(kase) + '/1'

        expect(page).to have_selector 'span.c-comment-thread-entity'

        click_on 'Edit this case'
        find('.c-comment-thread-entity', match: :first).click
        page.driver.browser.action
            .send_keys('new text added')
            .perform
        click_on 'Save'
        expect(page).to have_content 'Saved successfully'

        page.driver.browser.navigate.refresh
        expect(page).to have_content 'new text added'
        expect(page).not_to have_selector 'span.c-comment-thread-entity'
        expect(page).to have_content '1 COMMENT'

        click_on '1 comment'
        expect(page).to have_content 'Test comment'

        click_on 'Test comment'
        expect(page).to have_content 'The text being discussed has changed'
      end
    end
  end

  context 'removing a card' do
    scenario 'is possible' do
      kase = create :case_with_edgenotes
      visit case_path(kase) + '/1'
      expect(page).to have_selector('.Card', count: 5)

      click_button 'Edit this case'
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

  context 'at the same time as someone else' do
    scenario 'the elements they’re editing are locked' do
      skip

      kase = create :case_with_edgenotes
      other_reader = create :reader, :editor

      visit case_path(kase, edit: true)

      Capybara.using_session 'other' do
        login_as other_reader
        visit case_path(kase, edit: true)
        find('.pt-editable-text', text: kase.kicker).click
      end

      find('.pt-editable-text', text: kase.kicker).hover
      expect(page).to have_content 'This section is locked'
      click_button 'Edit Anyway'

      expect(kase).not_to have_content 'This section is locked'
      find('.pt-editable-text', text: kase.kicker).click

      Capybara.using_session 'other' do
        find('.pt-editable-text', text: kase.kicker).hover
        expect(page).to have_content 'This section is locked'
      end
    end
  end
end
