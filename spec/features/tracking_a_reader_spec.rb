# frozen_string_literal: true

require 'rails_helper'

feature 'Tracking a reader' do
  let!(:kase) { create :case_with_elements, :published }

  context 'who is not invisible' do
    let(:reader) { create :reader }

    before { login_as reader }

    scenario 'records when they view a card' do
      visit "#{case_path kase}/1"
      expect(page).to have_selector '.Card'
      sleep 5
      stop_tracking
      expect(eventually { kase.pages.first.cards.first.views == 1 }).to be true
      expect(kase.pages.first.cards.first.uniques).to eq 1
      click_button 'Overview'

      visit "#{case_path kase}/1"
      expect(page).to have_selector '.Card'
      sleep 5
      stop_tracking
      expect(eventually { kase.pages.first.cards.first.views == 2 }).to be true
      expect(kase.pages.first.cards.first.uniques).to eq 1
      click_button 'Overview'
    end
  end

  context 'who is invisible' do
    let(:reader) { create :reader, :invisible }

    before { login_as reader }

    scenario 'does not record when they view a card' do
      visit "#{case_path kase}/1"
      expect(page).to have_selector '.Card'
      sleep 5
      stop_tracking
      click_button 'Overview'
      expect(kase.pages.first.cards.first.views).to eq 0
      expect(kase.pages.first.cards.first.uniques).to eq 0
    end
  end

  def eventually(timeout: Capybara.default_max_wait_time)
    deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + timeout

    loop do
      return true if yield
      return false if Process.clock_gettime(Process::CLOCK_MONOTONIC) >= deadline

      sleep 0.1
    end
  end

  def stop_tracking
    page.execute_script("window.dispatchEvent(new Event('beforeunload'))")
    sleep 1
  end
end
