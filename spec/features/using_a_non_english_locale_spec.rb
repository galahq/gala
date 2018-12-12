# frozen_string_literal: true

require 'rails_helper'

feature 'Using a non-English locale' do
  scenario 'the catalog and case pages load' do
    reader = create :reader, locale: :fr, password: 'secret'
    case_study = create :case_with_elements
    # case_study.tag 'water'

    login_as reader

    click_on case_study.title
    expect(page).to have_content 'TABLE DES MATIÈRES'

    click_on case_study.pages.first.title
    expect(page).to have_button 'Retour au résumé'
  end
end
