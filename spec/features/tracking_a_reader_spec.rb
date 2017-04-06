require 'rails_helper'

feature 'Tracking a reader' do
  let!(:kase) { create :case_with_elements, :published }

  context 'who is not invisible' do
    let(:reader) { create :reader }

    before { login_as reader }

    scenario 'records when they view a card' do
      first_page_path = "#{case_path 'en', kase}/#{kase.pages.first.case_element.position}"
      visit first_page_path
      sleep 1
      visit root_path
      expect(kase.pages.first.cards.first.views).to eq 1
      expect(kase.pages.first.cards.first.uniques).to eq 1

      visit first_page_path
      sleep 1
      visit root_path
      expect(kase.pages.first.cards.first.views).to eq 2
      expect(kase.pages.first.cards.first.uniques).to eq 1
    end
  end

  context 'who is invisible' do
    let(:reader) { create :reader, :invisible }

    before { login_as reader }

    scenario 'does not record when they view a card' do
      first_page_path = "#{case_path 'en', kase}/#{kase.pages.first.case_element.position}"
      visit first_page_path
      sleep 1
      visit root_path
      expect(kase.pages.first.cards.first.views).to eq 0
      expect(kase.pages.first.cards.first.uniques).to eq 0
    end
  end

end
