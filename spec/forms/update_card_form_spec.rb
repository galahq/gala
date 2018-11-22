# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UpdateCardForm, type: :model do
  it 'updates the card’s element' do
    kase = create :case_with_elements
    card = kase.pages.first.cards.first

    form = UpdateCardForm.new card: card, page_id: kase.pages.second.id
    expect(form).to be_valid

    form.save
    card.reload
    expect(card.element).to eq kase.pages.second
  end

  it 'is invalid if the page belongs to a different case' do
    case1 = create :case_with_elements
    case2 = create :case_with_elements

    form = UpdateCardForm.new card: case1.cards.take,
                              page_id: case2.pages.take.id
    expect(form).not_to be_valid
  end
end
