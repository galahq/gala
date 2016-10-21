require 'rails_helper'

feature 'Viewing a case' do
  let(:user) { create :reader }

  context 'as a normal user' do
    context 'a published case' do
      let!(:published_case) { create :case, :featured, :published}
      before { login_as user }

      scenario 'is accessible' do
        click_link published_case.title
        expect(page).to have_content 'Table of Contents'

        click_link published_case.pages.first.title
        expect(all('.Card').count).to eq published_case.pages.first.cards.count

        click_link "Next:"
        expect(all('.Card').count).to eq published_case.pages.second.cards.count
      end
    end

    context 'a forthcoming case' do
      let!(:forthcoming_case) { create :case, :featured }
      before { login_as user }

      scenario 'is not accessible' do
        expect(page).to have_css '.catalog-case-unpublished-banner'
        click_link forthcoming_case.title
        expect(current_path).to eq root_path
      end
    end

  end

  context 'as a normal user enrolled in a forthcoming case' do
    let(:enrollment) { create :enrollment}

    context 'that case' do
      let(:forthcoming_case) { enrollment.case }
      before { login_as enrollment.reader }

      scenario 'is accessible' do
        click_link forthcoming_case.title
        expect(page).to have_content 'Table of Contents'
      end
    end

    context 'a different forthcoming case' do
      let!(:another_forthcoming_case) { create :case }
      before { login_as enrollment.reader }

      scenario 'is not accessible' do
        click_link another_forthcoming_case.title
        expect(current_path).to eq root_path
      end
    end
  end

end
