# frozen_string_literal: true

require 'rails_helper'

feature 'Leaving a comment' do
  let (:enrollment) { create :enrollment }

  before { login_as enrollment.reader }

  scenario 'is possible' do
    kase = enrollment.case
    visit case_path 'en', kase

    first_page = kase.pages.first
    click_link first_page.title
    expect(page).to have_link 'Respond'
    click_link 'Respond', match: :first

    first_paragraph = find '.DraftEditor-root p', match: :first
    first_paragraph.double_click
    click_button 'Respond here'
    expect(page).to have_selector 'textarea'

    fill_in placeholder: 'Write a reply...', with: 'Test comment'
    click_button 'Submit'
    expect(page).to have_content 'Test comment'
    expect(find('textarea').value).to be_blank
  end

  context 'in response to another comment' do
    let!(:other_reader) do
      other_reader = create :reader
    end

    let!(:comment_thread) do
      first_card = enrollment.case.pages.first.cards.first
      first_letter = first_card.paragraphs[0][0]
      comment_thread = first_card.comment_threads.create(
        id: 4444,
        start: 0,
        length: 1,
        block_index: 0,
        original_highlight_text: first_letter,
        reader: other_reader,
        locale: I18n.locale
      )
    end

    let!(:comment) do
      comment_thread.comments.create(
        content: 'Test comment',
        reader: other_reader
      )
    end

    it 'is possible' do
      kase = enrollment.case
      visit case_path 'en', enrollment.case
      click_link kase.pages.first.title

      comment_entity = find '.c-comment-thread-entity'
      comment_entity.click
      expect(page).to have_content comment.content

      fill_in placeholder: 'Write a reply...', with: 'Test reply'
      click_button 'Submit'
      sleep 1
      expect(page).to have_content 'Test reply'
      expect(find('textarea').value).to be_blank
    end

    it 'displays a toast to the other comment’s author' do
      comment_thread.comments.create(
        content: 'Test reply',
        reader: enrollment.reader
      )
      visit case_path('en', enrollment.case) + '/1'
      comment_thread.comments.create(
        content: 'Should trigger toast',
        reader: other_reader
      )
      expect(page).to have_content 'replied to your comment'
    end

    it 'sends an email to the other comment’s author' do
      comment_thread.comments.create content: 'Test reply',
                                     reader: enrollment.reader
      email = ActionMailer::Base.deliveries.last

      expect(email.to.first).to eq other_reader.email
      expect(email.text_part.body.to_s).to match 'Test reply'
      expect(email.html_part.body.to_s).to match 'Test reply'
    end

    it 'doesn’t send an email notification if the other author has ' \
       'notifications turned off' do
      ActionMailer::Base.deliveries.clear
      other_reader.update send_reply_notifications: false

      comment_thread.comments.create content: 'Test reply',
                                     reader: enrollment.reader
      email = ActionMailer::Base.deliveries.last

      expect(email).to be_nil
    end
  end
end
