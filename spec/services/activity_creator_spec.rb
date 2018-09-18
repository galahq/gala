# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActivityCreator, type: :model do
  describe '::create' do
    let(:kase) { create :case }
    let(:activity_creator) { described_class.for(kase) }

    it 'creates a new page with a default icon' do
      page = activity_creator.page
      expect(page).to be_a Page
      expect(page).to be_persisted
      expect(page.case).to eq kase
      expect(page.icon_slug).to eq 'activity-evaluate'
    end

    it 'puts a card on the page' do
      expect(activity_creator.page.cards.length).to eq 1
    end

    it 'fills in the card with default contents' do
      expect(activity_creator.card.raw_content.paragraphs).to eq [
        'Instructions',
        'Use the attached file to...'
      ]
      expect(activity_creator.card).not_to have_changes_to_save
    end

    it 'puts an Edgenote on the page' do
      block = activity_creator.card.raw_content.blocks.second
      expect(block.entity_ranges).to include(include(offset: 8, length: 13))
      expect(activity_creator.edgenote).to be_persisted
      expect(activity_creator.edgenote.caption)
        .to eq 'Edit this Edgenote to upload or link to your activity materials.'
    end
  end
end
