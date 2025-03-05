# frozen_string_literal: true

require 'rails_helper'

feature 'Viewing a case' do
  context 'while not logged in' do
    let!(:kase) { create :case_with_elements, :published }

    scenario 'is possible' do
      visit root_path
      click_link kase.title
      expect(page).to have_content kase.pages.first.title
    end
  end
  context 'as a normal user' do
    let(:user) { create :reader }

    context 'a published case' do
      let!(:published_case) do
        create :case_with_elements, :published
      end

      before do
        login_as user
        visit root_path
      end

      scenario 'is accessible' do
        click_link published_case.title
        expect(page).to have_content published_case.pages.first.title

        click_link published_case.pages.first.title
        sleep(1)
        expect(all('.Card').count).to eq published_case.pages.first.cards.count
        expect(page).to have_selector '.DraftEditor-root'
      end

      scenario 'does not have visible statistics' do
        click_link published_case.title
        click_link published_case.pages.first.title
        expect(page).not_to have_selector '.c-statistics'
      end

      context 'without a forum for your active community' do
        scenario 'the community chooser displays the community as inactive' do
          invited_community = create :community
          user.invitations.create community: invited_community
          user.update active_community_id: invited_community.id

          visit case_path published_case
          click_button 'Enroll'
          click_link(published_case.pages.first.title)
          expect(page).to have_content invited_community.name.to_s
          find_link(invited_community.name).hover
          expect(find_link(invited_community.name)).to have_selector '.bp3-icon-cross'

          sleep 1
          click_link(invited_community.name)
          find('.bp3-menu-item', text: GlobalCommunity.instance.name).click
          expect(first('.CommentThreads__banner')).to have_content 'RESPOND'
        end
      end
    end

    context 'a forthcoming case' do
      let!(:forthcoming_case) { create :case }

      before do
        login_as user
        visit root_path
      end

      scenario 'is not accessible' do
        expect(page).not_to have_content forthcoming_case.title
      end
    end
  end

  context 'as a normal user enrolled in a forthcoming case' do
    let(:enrollment) { create :enrollment }

    context 'that case' do
      let(:forthcoming_case) { enrollment.case }
      before do
        login_as enrollment.reader
        visit root_path
      end

      scenario 'is accessible' do
        expect(find('[data-test-id="enrollments"]'))
          .to have_link forthcoming_case.kicker
        click_link forthcoming_case.kicker
        expect(page).to have_content forthcoming_case.pages.first.title
      end
    end
  end

  context 'as an editor' do
    let(:user) { create :reader, :editor }
    let!(:any_case) { create :case_with_elements, :in_catalog }

    before do
      login_as user
      visit root_path
    end

    scenario 'statistics are visible' do
      click_link any_case.kicker
      click_link any_case.pages.first.title
      expect(page).to have_selector '.c-statistics'
    end
  end
end
