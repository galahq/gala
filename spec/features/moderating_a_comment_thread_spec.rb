# frozen_string_literal: true

require 'rails_helper'

feature 'Moderating a comment thread' do
  let!(:enrollment) { create :enrollment, reader: create(:reader, :editor) }
  let!(:other_reader) { create :reader }
  let!(:comment_thread) do
    first_card = enrollment.case.pages.first.cards.first
    first_letter = first_card.paragraphs[0][0]
    first_card.comment_threads.create(
      original_highlight_text: first_letter,
      reader: other_reader,
      locale: I18n.locale,
      forum: create(:forum, :with_community)
    )
  end

  before do
    login_as enrollment.reader
    comment_thread.comments.create(
      content: 'First comment',
      reader: other_reader
    )
    comment_thread.comments.create(
      content: 'Second comment',
      reader: other_reader
    )
  end

  it 'is possible to delete a comment as an editor' do
    visit comment_thread_path comment_thread
    accept_confirm 'Are you sure' do
      within '[data-testid="SelectedCommentThread"]' do
        find('blockquote', text: 'Second comment').hover
        find('[aria-label="Delete comment"]').click
      end
    end
    expect(page).not_to have_content 'Second comment'
    accept_confirm 'Are you sure' do
      within '[data-testid="SelectedCommentThread"]' do
        find('blockquote', text: 'First comment').hover
        find('[aria-label="Delete comment thread"]').click
      end
    end
    expect(page).not_to have_content 'First comment'
  end
end
