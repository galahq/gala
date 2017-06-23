require 'rails_helper'

feature 'Tracking a reader' do
  let!(:kase) { create :case_with_elements, :published }

  context 'who is not invisible' do
    let(:reader) { create :reader }

    before { login_as reader }

    scenario 'records when they view a card' do
      visit "#{case_path 'en', kase}/1"
      sleep 4
      visit root_path
      sleep 2
      expect(kase.pages.first.cards.first.views).to eq 1
      expect(kase.pages.first.cards.first.uniques).to eq 1
      expect(kase.pages.first.cards.last.views).to eq 0
      visit "#{case_path 'en', kase}/1"
      sleep 4
      visit root_path
      sleep 2
      expect(kase.pages.first.cards.first.views).to eq 2
      expect(kase.pages.first.cards.first.uniques).to eq 1
      expect(kase.pages.first.cards.last.views).to eq 0
    end
  end

  context 'who is invisible' do
    let(:reader) { create :reader, :invisible }

    before { login_as reader }

    scenario 'does not record when they view a card' do
      visit "#{case_path 'en', kase}/1"
      sleep 4
      visit root_path
      expect(kase.pages.first.cards.first.views).to eq 0
      expect(kase.pages.first.cards.first.uniques).to eq 0
    end
  end

end
