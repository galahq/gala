# frozen_string_literal: true

require 'rails_helper'

feature 'Citing your sources with a citation entity' do
  let!(:reader) { create :reader }
  let!(:case_study) do
    create(:case).tap { |c| reader.my_cases << c }
  end

  before { login_as reader }

  scenario 'is possible' do
    visit case_path(case_study)
    click_on 'Edit this module'

    within '.c-toc' do
      click_on 'Page'
      click_on 'Untitled'
    end

    first_paragraph = find('.DraftEditor-root div[data-block]', match: :first)
    first_paragraph.click

    click_on 'Add citation'
    expect(page).to have_content 'Citation added'

    find('[data-test-id=CitationEntity]').click
    within '[data-test-id=CitationTooltip]' do
      fill_in 'Title', with: 'Google'
      fill_in 'URL', with: 'google.com'
      click_on 'Save'
    end

    click_on 'Save'
    click_on 'Stop editing this module'

    find('[data-test-id=CitationEntity]').click
    within '[data-test-id=CitationTooltip]' do
      expect(page).to have_content 'Google'
      expect(page).to have_link 'Learn more', href: 'http://google.com'
    end
  end
end
