require 'rails_helper'

feature 'Viewing a case' do
  let!(:published_case) { create :case, :featured, :published}
  let!(:forthcoming_case) { create :case, :featured }

  context 'as a normal user' do
    let(:user) { create :reader }

    before { login_as user }

    scenario 'published cases are accessible' do
      click_link published_case.title
      expect(page).to have_content 'Table of Contents'

      click_link published_case.pages.first.title
      expect(all('.Card').count).to eq published_case.pages.first.cards.count

      click_link "Next:"
      expect(all('.Card').count).to eq published_case.pages.second.cards.count
    end

    scenario 'forthcoming cases are not accessible' do
      expect(page).to have_css '.catalog-case-unpublished-banner'
      click_link forthcoming_case.title
      expect(current_path).to eq root_path
    end
  end

  context 'as a normal user enrolled in a forthcoming case' do
    let(:enrollment) { create :enrollment, case: forthcoming_case }
    let!(:another_forthcoming_case) { create :case }

    before { login_as enrollment.reader }

    scenario 'that case is accessible' do
      click_link forthcoming_case.title
      expect(page).to have_content 'Table of Contents'
    end

    scenario 'other forthcoming cases are also accessible' do
      click_link another_forthcoming_case.title
      expect(current_path).to eq root_path
    end
  end

end
